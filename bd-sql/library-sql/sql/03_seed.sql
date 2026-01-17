USE library;

INSERT INTO categorias (nombre, descripcion) VALUES
('Ficción', 'Novelas y relatos de ficción'),
('No Ficción', 'Libros basados en hechos reales'),
('Ciencia', 'Libros científicos y técnicos'),
('Historia', 'Libros de historia'),
('Biografías', 'Vidas de personajes históricos');

INSERT INTO autores (nombre, apellido, fecha_nacimiento, nacionalidad) VALUES
('Gabriel', 'García Márquez', '1927-03-06', 'Colombiano'),
('Isabel', 'Allende', '1942-08-02', 'Chilena'),
('Julio', 'Cortázar', '1914-08-26', 'Argentino');

INSERT INTO libros (titulo, isbn, autor_id, categoria_id, editorial, anio_publicacion, numero_paginas, precio, stock) VALUES
('Cien años de soledad', '978-84-376-0494-7', 1, 1, 'Editorial Sudamericana', 1967, 417, 25.99, 5),
('La casa de los espíritus', '978-84-204-3246-6', 2, 1, 'Plaza & Janés', 1982, 352, 22.50, 3),
('Rayuela', '978-84-339-6725-9', 3, 1, 'Editorial Sudamericana', 1963, 736, 28.75, 2);

INSERT INTO usuarios (nombre, apellido, email, telefono) VALUES
('María', 'González', 'maria@example.com', '+34 600 123 456'),
('Carlos', 'Rodríguez', 'carlos@example.com', '+34 600 654 321'),
('Ana', 'Martínez', 'ana@example.com', '+34 600 987 654');

INSERT INTO prestamos (usuario_id, libro_id, fecha_devolucion_esperada, estado, multa, notas)
VALUES
(1, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'activo', 0.00, 'Prestamo de prueba vencido'),
(1, 2, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'activo', 0.00, 'Prestamo de prueba vigente'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'atrasado', 0.00, 'Marcado como atrasado');
