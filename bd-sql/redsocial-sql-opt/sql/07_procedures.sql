USE redsocial;

DELIMITER //

CREATE PROCEDURE crear_publicacion_con_comentarios(
  IN p_usuario_id BIGINT,
  IN p_contenido TEXT,
  IN p_privacidad ENUM('publica','solo_seguidores','privada'),
  IN p_comentarios_json JSON
)
BEGIN
  DECLARE v_publicacion_id BIGINT;
  DECLARE v_i INT DEFAULT 0;
  DECLARE v_n INT;
  DECLARE v_com_usuario_id BIGINT;
  DECLARE v_com_texto TEXT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Validar usuario autor (bloqueo para consistencia en alta concurrencia)
  IF NOT EXISTS (
    SELECT 1 FROM usuarios WHERE id = p_usuario_id AND activo=1 FOR UPDATE
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Autor no valido';
  END IF;

  INSERT INTO publicaciones (usuario_id, contenido, privacidad, estado)
  VALUES (p_usuario_id, p_contenido, p_privacidad, 'activa');

  SET v_publicacion_id = LAST_INSERT_ID();
  SET v_n = COALESCE(JSON_LENGTH(p_comentarios_json), 0);

  WHILE v_i < v_n DO
    SET v_com_usuario_id = JSON_EXTRACT(p_comentarios_json, CONCAT('$[', v_i, '].usuario_id'));
    SET v_com_texto = JSON_UNQUOTE(JSON_EXTRACT(p_comentarios_json, CONCAT('$[', v_i, '].comentario')));

    IF v_com_usuario_id IS NULL OR v_com_texto IS NULL OR CHAR_LENGTH(v_com_texto) = 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Comentario invalido';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM usuarios WHERE id = v_com_usuario_id AND activo=1 FOR UPDATE
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario de comentario no valido';
    END IF;

    INSERT INTO comentarios (publicacion_id, usuario_id, comentario, estado)
    VALUES (v_publicacion_id, v_com_usuario_id, v_com_texto, 'activo');

    SET v_i = v_i + 1;
  END WHILE;

  COMMIT;

  SELECT
    p.id,
    p.usuario_id,
    p.privacidad,
    p.creado_en,
    (
      SELECT COUNT(*) FROM comentarios c
      WHERE c.publicacion_id = p.id AND c.estado='activo'
    ) AS total_comentarios
  FROM publicaciones p
  WHERE p.id = v_publicacion_id;
END //

DELIMITER ;

-- Ejemplo de uso:
-- CALL crear_publicacion_con_comentarios(
--   1,
--   'Post transaccional',
--   'publica',
--   JSON_ARRAY(
--     JSON_OBJECT('usuario_id',2,'comentario','Bien ahi'),
--     JSON_OBJECT('usuario_id',3,'comentario','Excelente')
--   )
-- );
