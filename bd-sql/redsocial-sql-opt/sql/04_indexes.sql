USE redsocial;

-- Publicaciones: feed por usuario/fecha + estado/privacidad frecuentes
CREATE INDEX idx_pub_usuario_fecha ON publicaciones (usuario_id, creado_en DESC);
CREATE INDEX idx_pub_estado_fecha ON publicaciones (estado, creado_en DESC);
CREATE INDEX idx_pub_priv_estado_fecha ON publicaciones (privacidad, estado, creado_en DESC);

-- Comentarios: conteos y listas por publicacion, y actividad por usuario
CREATE INDEX idx_com_publicacion_fecha ON comentarios (publicacion_id, creado_en DESC);
CREATE INDEX idx_com_usuario_fecha ON comentarios (usuario_id, creado_en DESC);
CREATE INDEX idx_com_estado_publicacion ON comentarios (estado, publicacion_id);

-- Reacciones: conteos por publicacion y analítica por usuario/fecha
CREATE INDEX idx_rea_publicacion_fecha ON reacciones (publicacion_id, creado_en DESC);
CREATE INDEX idx_rea_usuario_fecha ON reacciones (usuario_id, creado_en DESC);
CREATE INDEX idx_rea_tipo_publicacion ON reacciones (tipo, publicacion_id);

-- Follows: consultar seguidos/seguidores rápido
CREATE INDEX idx_fol_seguido ON follows (seguido_id, creado_en DESC);
-- (seguidor_id, seguido_id) ya es PK
