USE redsocial;

-- Q1 optimizada: pre-agregar comentarios y reacciones, luego JOIN
EXPLAIN
SELECT
  p.id,
  p.usuario_id,
  p.creado_en,
  COALESCE(c.total_comentarios, 0) AS total_comentarios,
  COALESCE(r.total_reacciones, 0) AS total_reacciones
FROM publicaciones p
LEFT JOIN (
  SELECT publicacion_id, COUNT(*) AS total_comentarios
  FROM comentarios
  WHERE estado='activo'
  GROUP BY publicacion_id
) c ON c.publicacion_id = p.id
LEFT JOIN (
  SELECT publicacion_id, COUNT(*) AS total_reacciones
  FROM reacciones
  GROUP BY publicacion_id
) r ON r.publicacion_id = p.id
WHERE p.estado='activa'
ORDER BY p.creado_en DESC
LIMIT 50;

-- Q2 optimizada: feed con JOIN (mejor para el optimizador) + control privacidad
-- Regla simple:
-- - Publica: todos
-- - Solo_seguidores: solo si el usuario sigue al autor
-- - Privada: solo si es el mismo usuario
EXPLAIN
SELECT p.*
FROM publicaciones p
LEFT JOIN follows f
  ON f.seguidor_id = 1 AND f.seguido_id = p.usuario_id
WHERE p.estado='activa'
  AND (
    p.privacidad = 'publica'
    OR (p.privacidad = 'solo_seguidores' AND f.seguido_id IS NOT NULL)
    OR (p.privacidad = 'privada' AND p.usuario_id = 1)
  )
ORDER BY p.creado_en DESC
LIMIT 50;

-- Q3 optimizada: engagement por autor en 1 pasada (CTE)
EXPLAIN
WITH post_por_autor AS (
  SELECT usuario_id, COUNT(*) AS posts
  FROM publicaciones
  WHERE estado='activa'
  GROUP BY usuario_id
),
reacciones_por_autor AS (
  SELECT p.usuario_id, COUNT(*) AS reacciones
  FROM reacciones r
  JOIN publicaciones p ON p.id = r.publicacion_id
  WHERE p.estado='activa'
  GROUP BY p.usuario_id
)
SELECT
  u.id,
  u.username,
  COALESCE(pp.posts,0) AS posts,
  COALESCE(rp.reacciones,0) AS reacciones
FROM usuarios u
LEFT JOIN post_por_autor pp ON pp.usuario_id = u.id
LEFT JOIN reacciones_por_autor rp ON rp.usuario_id = u.id
WHERE u.activo=1
ORDER BY reacciones DESC
LIMIT 10;
