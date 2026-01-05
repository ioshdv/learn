const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  const sql = `
    DROP DATABASE IF EXISTS ${process.env.DB_NAME};
    CREATE DATABASE ${process.env.DB_NAME};
    USE ${process.env.DB_NAME};

    CREATE TABLE proveedores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      activo TINYINT(1) DEFAULT 1
    );

    CREATE TABLE categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL
    );

    CREATE TABLE productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      codigo VARCHAR(50) UNIQUE,
      nombre VARCHAR(100) NOT NULL,
      precio_compra DECIMAL(10,2),
      precio_venta DECIMAL(10,2),
      stock_actual INT DEFAULT 0,
      stock_minimo INT DEFAULT 5,
      barcode_data VARCHAR(100) UNIQUE,
      categoria_id INT,
      proveedor_id INT,
      activo TINYINT(1) DEFAULT 1,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
    );

    CREATE TABLE ordenes_compra (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero_orden VARCHAR(50) UNIQUE,
      proveedor_id INT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total DECIMAL(10,2),
      estado ENUM('pendiente', 'completada') DEFAULT 'pendiente',
      FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
    );

    CREATE TABLE detalle_ordenes_compra (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orden_compra_id INT,
      producto_id INT,
      cantidad_solicitada INT,
      precio_unitario DECIMAL(10,2),
      FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );

    -- Datos de prueba para verificación
    INSERT INTO proveedores (nombre, email) VALUES ('Tech Supplier', 'ventas@tech.com');
    INSERT INTO categorias (nombre) VALUES ('Computación');
    INSERT INTO productos (codigo, nombre, precio_compra, precio_venta, stock_actual, stock_minimo, barcode_data, categoria_id, proveedor_id) 
    VALUES ('SKU-001', 'Laptop Pro 15', 800.00, 1200.00, 10, 3, '1234567890123', 1, 1);
  `;

  try {
    await connection.query(sql);
    console.log('✅ Sistema de inventario inicializado con éxito.');
  } catch (error) {
    console.error('❌ Error en inicialización:', error.message);
  } finally {
    await connection.end();
  }
}

init();