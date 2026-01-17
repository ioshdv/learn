USE library;

CREATE TABLE autores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  nacionalidad VARCHAR(50),
  biografia TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_autor (nombre, apellido)
);

CREATE TABLE categorias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE libros (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(200) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  autor_id INT NOT NULL,
  categoria_id INT,
  editorial VARCHAR(100),
  anio_publicacion YEAR,
  numero_paginas INT,
  descripcion TEXT,
  precio DECIMAL(8,2),
  stock INT DEFAULT 0,
  disponible BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  INDEX idx_titulo (titulo),
  INDEX idx_autor (autor_id),
  INDEX idx_categoria (categoria_id),
  INDEX idx_disponible (disponible)
);

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  fecha_nacimiento DATE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email),
  INDEX idx_activo (activo)
);

CREATE TABLE prestamos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  libro_id INT NOT NULL,
  fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_devolucion_esperada DATE NOT NULL,
  fecha_devolucion_real DATE NULL,
  estado ENUM('activo', 'devuelto', 'atrasado', 'perdido') DEFAULT 'activo',
  multa DECIMAL(6,2) DEFAULT 0.00,
  notas TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
  INDEX idx_usuario (usuario_id),
  INDEX idx_libro (libro_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_prestamo (fecha_prestamo)
);
