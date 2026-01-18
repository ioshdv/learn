USE redsocial;

-- Q1 (lenta): Para cada publicacion, cuenta comentarios y reacciones con subconsultas correlacionadas
EXPLAIN
SELECT
  p.id,
  p.usuario_id,
  p.creado_en,
  (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id AND c.estado='activo') AS total_comentarios,
  (SELECT COUNT(*) FROM reacciones r WHERE r.publicacion_id = p.id) AS total_reacciones
FROM publicaciones p
WHERE p.estado='activa'
ORDER BY p.creado_en DESC
LIMIT 50;

-- Q2 (lenta): Feed "solo seguidos" con IN y sin controlar privacidad
EXPLAIN
SELECT p.*
FROM publicaciones p
WHERE p.usuario_id IN (
  SELECT f.seguido_id
  FROM follows f
  WHERE f.seguidor_id = 1
)
AND p.estado='activa'
ORDER BY p.creado_en DESC
LIMIT 50;

-- Q3 (lenta): Top autores por engagement con 2 subconsultas por usuario
EXPLAIN
SELECT
  u.id,
  u.username,
  (SELECT COUNT(*) FROM publicaciones p WHERE p.usuario_id=u.id AND p.estado='activa') AS posts,
  (SELECT COUNT(*)
   FROM reacciones r
   JOIN publicaciones p2 ON p2.id=r.publicacion_id
   WHERE p2.usuario_id=u.id) AS reacciones
FROM usuarios u
WHERE u.activo=1
ORDER BY reacciones DESC
LIMIT 10;
