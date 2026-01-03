const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'ttops_node_db',
        multipleStatements: true // Permitir varias consultas a la vez
    });

    try {
        console.log('🧹 Iniciando limpieza de base de datos...');

        // Desactivar llaves foráneas temporalmente para poder vaciar tablas relacionadas
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tablas = ['reseñas', 'pedidos', 'productos', 'usuarios'];
        
        for (const tabla of tablas) {
            await connection.query(`TRUNCATE TABLE ${tabla}`);
            console.log(`✅ Tabla ${tabla} vaciada y reseteada.`);
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('\n✨ Base de datos lista para pruebas limpias.');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        await connection.end();
        process.exit();
    }
}

cleanup();