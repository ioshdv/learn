DROP DATABASE IF EXISTS sistema_inventario;
CREATE DATABASE sistema_inventario;
USE sistema_inventario;

CREATE TABLE categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(100),
  email VARCHAR(150),
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  precio_compra DECIMAL(10,2),
  precio_venta DECIMAL(10,2) NOT NULL,
  stock_actual INT DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  categoria_id INT,
  proveedor_id INT,
  activo BOOLEAN DEFAULT TRUE,
  barcode_data VARCHAR(255) UNIQUE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  INDEX idx_barcode (barcode_data)
);

CREATE TABLE tipos_movimiento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL
);

CREATE TABLE ordenes_compra (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_orden VARCHAR(50) UNIQUE NOT NULL,
  proveedor_id INT NOT NULL,
  estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE detalle_ordenes_compra (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orden_compra_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad_solicitada INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE movimientos_inventario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  producto_id INT NOT NULL,
  tipo_movimiento_id INT NOT NULL,
  cantidad INT NOT NULL,
  stock_anterior INT NOT NULL,
  stock_nuevo INT NOT NULL,
  referencia VARCHAR(100),
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (tipo_movimiento_id) REFERENCES tipos_movimiento(id)
);

INSERT INTO tipos_movimiento (nombre, tipo) VALUES 
('Compra', 'entrada'), 
('Venta', 'salida'), 
('Ajuste', 'ajuste');