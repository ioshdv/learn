const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function inicializarBaseDatos() {
  let connection;
  try {
    console.log('🚀 Iniciando conexión para creación de base de datos...');
    
    // Conexión inicial sin base de datos seleccionada
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    // Leer el archivo SQL de la raíz
    const sqlPath = path.join(__dirname, 'init-database.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error('El archivo init-database.sql no existe en la raíz');
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script SQL completo
    console.log('⏳ Ejecutando script SQL...');
    await connection.query(sql);
    
    console.log('✅ Base de datos y tablas creadas/actualizadas correctamente');

    // Verificación rápida
    await connection.query(`USE ${process.env.DB_NAME}`);
    const [categorias] = await connection.query('SELECT COUNT(*) AS total FROM categorias');
    console.log(`📊 Categorías iniciales: ${categorias[0].total}`);

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada.');
    }
  }
}

inicializarBaseDatos();
