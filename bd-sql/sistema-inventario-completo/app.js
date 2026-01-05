const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const ProductosController = require('./controllers/productosController');
const InventoryReports = require('./reports/inventoryReports');

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

const productosCtrl = new ProductosController(pool);
const reports = new InventoryReports(pool);

// Endpoints de UI y Barcode
app.get('/api/productos', (req, res) => productosCtrl.listarProductos(req, res));
app.get('/api/productos/barcode/:barcode', (req, res) => productosCtrl.buscarPorBarcode(req, res));
app.get('/api/proveedores', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM proveedores WHERE activo = 1');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
app.post('/api/ordenes', (req, res) => productosCtrl.crearOrdenCompra(req, res));

// --- FUNCIONALIDAD: API DE INTEGRACIÓN CON SISTEMAS EXTERNOS (ERP) ---
app.get('/api/v1/external/inventory-sync', async (req, res) => {
  try {
    const data = await reports.getValoracionInventario();
    res.json({ 
      status: "success", 
      version: "1.0",
      timestamp: new Date().toISOString(), 
      data 
    });
  } catch (error) {
    res.status(500).json({ error: 'ERP Integration Error', message: error.message });
  }
});

// Movimientos de stock con disparador de alertas
app.patch('/api/productos/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      'SELECT stock_actual, stock_minimo, nombre FROM productos WHERE id = ? FOR UPDATE',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    const nuevoStock = rows[0].stock_actual + cantidad;
    await conn.execute('UPDATE productos SET stock_actual = ? WHERE id = ?', [nuevoStock, id]);
    await conn.commit();

    let emailSent = false;
    if (nuevoStock <= rows[0].stock_minimo) {
      emailSent = await productosCtrl.enviarAlertaStock({ ...rows[0], id, stock_actual: nuevoStock });
    }
    res.json({ success: true, nuevoStock, alerta: nuevoStock <= rows[0].stock_minimo, emailSent });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally { conn.release(); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor activo en puerto ${PORT}`));