USE redsocial;

-- R1: Engagement por publicacion (comentarios + reacciones) y ranking global
WITH agg AS (
  SELECT
    p.id AS publicacion_id,
    p.usuario_id,
    DATE(p.creado_en) AS dia,
    COALESCE(c.total_comentarios, 0) AS comentarios,
    COALESCE(r.total_reacciones, 0) AS reacciones,
    COALESCE(c.total_comentarios, 0) + COALESCE(r.total_reacciones, 0) AS engagement
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
)
SELECT
  publicacion_id,
  usuario_id,
  dia,
  comentarios,
  reacciones,
  engagement,
  DENSE_RANK() OVER (ORDER BY engagement DESC) AS ranking_global
FROM agg
ORDER BY ranking_global, publicacion_id;

-- R2: Tendencia diaria: total engagement y promedio movil 7 dias
WITH daily AS (
  SELECT
    DATE(p.creado_en) AS dia,
    COUNT(*) AS publicaciones,
    COALESCE(SUM(c.total_comentarios),0) AS comentarios,
    COALESCE(SUM(r.total_reacciones),0) AS reacciones,
    COALESCE(SUM(c.total_comentarios),0) + COALESCE(SUM(r.total_reacciones),0) AS engagement_total
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
  GROUP BY DATE(p.creado_en)
)
SELECT
  dia,
  publicaciones,
  comentarios,
  reacciones,
  engagement_total,
  AVG(engagement_total) OVER (
    ORDER BY dia
    ROWS 6 PRECEDING
  ) AS promedio_movil_7_dias,
  engagement_total - LAG(engagement_total) OVER (ORDER BY dia) AS delta_vs_dia_anterior
FROM daily
ORDER BY dia;

-- R3: Top 3 publicaciones por usuario (por engagement)
WITH post_eng AS (
  SELECT
    p.id AS publicacion_id,
    p.usuario_id,
    p.creado_en,
    COALESCE(c.total_comentarios, 0) + COALESCE(r.total_reacciones, 0) AS engagement
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
)
SELECT *
FROM (
  SELECT
    publicacion_id,
    usuario_id,
    creado_en,
    engagement,
    ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY engagement DESC, creado_en DESC) AS rn
  FROM post_eng
) t
WHERE rn <= 3
ORDER BY usuario_id, rn;
