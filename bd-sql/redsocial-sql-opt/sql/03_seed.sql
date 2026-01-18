USE redsocial;

INSERT INTO usuarios (username, email, activo) VALUES
('ana', 'ana@mail.com', 1),
('ben', 'ben@mail.com', 1),
('caro', 'caro@mail.com', 1),
('dani', 'dani@mail.com', 1),
('eli', 'eli@mail.com', 1);

INSERT INTO follows (seguidor_id, seguido_id) VALUES
(2,1),(3,1),(4,1),
(1,2),(3,2),
(1,3),(2,3),
(5,1);

INSERT INTO publicaciones (usuario_id, contenido, privacidad, estado, creado_en) VALUES
(1,'Post 1 Ana','publica','activa','2025-12-01 10:00:00'),
(1,'Post 2 Ana','publica','activa','2025-12-02 10:00:00'),
(2,'Post 1 Ben','publica','activa','2025-12-02 12:00:00'),
(3,'Post 1 Caro','solo_seguidores','activa','2025-12-03 09:00:00'),
(4,'Post 1 Dani','publica','activa','2025-12-04 18:00:00');

INSERT INTO comentarios (publicacion_id, usuario_id, comentario, creado_en) VALUES
(1,2,'Buen post','2025-12-01 11:00:00'),
(1,3,'Me gustó','2025-12-01 11:05:00'),
(2,2,'Sigue así','2025-12-02 11:00:00'),
(3,1,'Grande','2025-12-02 13:00:00'),
(3,3,'Top','2025-12-02 14:00:00'),
(4,1,'Interesante','2025-12-03 10:00:00');

INSERT INTO reacciones (publicacion_id, usuario_id, tipo, creado_en) VALUES
(1,2,'like','2025-12-01 11:01:00'),
(1,3,'love','2025-12-01 11:06:00'),
(2,3,'like','2025-12-02 11:01:00'),
(3,1,'wow','2025-12-02 13:05:00'),
(3,2,'like','2025-12-02 13:06:00'),
(5,1,'like','2025-12-04 18:10:00');
