USE library;

-- 1) Buscar libros por autor o titulo
SET @term := 'garcia';
SELECT
  l.id, l.titulo, l.isbn,
  CONCAT(a.nombre,' ',a.apellido) autor,
  c.nombre categoria,
  l.stock, l.disponible
FROM libros l
JOIN autores a ON a.id = l.autor_id
LEFT JOIN categorias c ON c.id = l.categoria_id
WHERE l.titulo LIKE CONCAT('%', @term, '%')
   OR a.nombre LIKE CONCAT('%', @term, '%')
   OR a.apellido LIKE CONCAT('%', @term, '%')
ORDER BY l.titulo;

-- 2) Prestamos activos de un usuario (por email)
SET @user_email := 'maria@example.com';
SELECT
  p.id prestamo_id,
  l.titulo,
  p.fecha_prestamo,
  p.fecha_devolucion_esperada,
  p.estado,
  p.multa
FROM prestamos p
JOIN usuarios u ON u.id = p.usuario_id
JOIN libros l ON l.id = p.libro_id
WHERE u.email = @user_email
  AND p.fecha_devolucion_real IS NULL
  AND p.estado IN ('activo','atrasado')
ORDER BY p.fecha_prestamo DESC;

-- 3) Libros disponibles
SELECT
  l.id,
  l.titulo,
  CONCAT(a.nombre,' ',a.apellido) autor,
  l.stock
FROM libros l
JOIN autores a ON a.id = l.autor_id
WHERE l.disponible = TRUE AND l.stock > 0
ORDER BY l.titulo;

-- 4) Calcular multas por retraso (sin actualizar)
SET @fine_per_day := 0.50;
SELECT
  p.id prestamo_id,
  u.email,
  l.titulo,
  p.fecha_devolucion_esperada,
  GREATEST(DATEDIFF(CURDATE(), p.fecha_devolucion_esperada), 0) dias_retraso,
  ROUND(GREATEST(DATEDIFF(CURDATE(), p.fecha_devolucion_esperada), 0) * @fine_per_day, 2) multa_calculada
FROM prestamos p
JOIN usuarios u ON u.id = p.usuario_id
JOIN libros l ON l.id = p.libro_id
WHERE p.fecha_devolucion_real IS NULL
  AND p.estado IN ('activo','atrasado')
  AND p.fecha_devolucion_esperada < CURDATE()
ORDER BY dias_retraso DESC;

-- 5) Reportes de uso mensual
-- 5.1 total por mes
SELECT DATE_FORMAT(fecha_prestamo, '%Y-%m') mes, COUNT(*) total_prestamos
FROM prestamos
GROUP BY mes
ORDER BY mes;

-- 5.2 por mes y estado
SELECT DATE_FORMAT(fecha_prestamo, '%Y-%m') mes, estado, COUNT(*) total
FROM prestamos
GROUP BY mes, estado
ORDER BY mes, estado;
