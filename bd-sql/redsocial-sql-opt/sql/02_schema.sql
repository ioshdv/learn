USE redsocial;

CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuarios_username (username),
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE follows (
  seguidor_id BIGINT NOT NULL,
  seguido_id BIGINT NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (seguidor_id, seguido_id),
  CONSTRAINT fk_follows_seguidor
    FOREIGN KEY (seguidor_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_follows_seguido
    FOREIGN KEY (seguido_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_no_self_follow CHECK (seguidor_id <> seguido_id)
) ENGINE=InnoDB;

CREATE TABLE publicaciones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  usuario_id BIGINT NOT NULL,
  contenido TEXT NOT NULL,
  privacidad ENUM('publica','solo_seguidores','privada') NOT NULL DEFAULT 'publica',
  estado ENUM('activa','eliminada') NOT NULL DEFAULT 'activa',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_publicaciones_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comentarios (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  publicacion_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  comentario TEXT NOT NULL,
  estado ENUM('activo','eliminado') NOT NULL DEFAULT 'activo',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comentarios_publicacion
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comentarios_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reacciones (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  publicacion_id BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  tipo ENUM('like','love','haha','wow','sad','angry') NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_reaccion_unica (publicacion_id, usuario_id),
  CONSTRAINT fk_reacciones_publicacion
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reacciones_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
