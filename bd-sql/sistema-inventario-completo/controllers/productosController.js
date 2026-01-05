const nodemailer = require('nodemailer');

class ProductosController {
  constructor(db) {
    this.db = db;
    // Configuración técnica del transporte SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true para puerto 465, false para otros
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Lista productos para la interfaz
  async listarProductos(req, res) {
    try {
      const [rows] = await this.db.query('SELECT * FROM productos WHERE activo = 1');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Búsqueda por sistema de códigos de barras (Barcode)
  async buscarPorBarcode(req, res) {
    const { barcode } = req.params;
    try {
      const [rows] = await this.db.query('SELECT * FROM productos WHERE barcode_data = ?', [barcode]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Registro de Órdenes de Compra con Proveedores
  async crearOrdenCompra(req, res) {
    const { proveedor_id, items } = req.body;
    const conn = await this.db.getConnection();
    try {
      await conn.beginTransaction();
      const numero_orden = `ORD-${Date.now()}`;
      let total = 0;
      items.forEach(i => total += (i.cantidad * i.precio));

      const [result] = await conn.execute(
        'INSERT INTO ordenes_compra (numero_orden, proveedor_id, total) VALUES (?, ?, ?)',
        [numero_orden, proveedor_id, total]
      );
      
      for (const item of items) {
        await conn.execute(
          'INSERT INTO detalle_ordenes_compra (orden_compra_id, producto_id, cantidad_solicitada, precio_unitario) VALUES (?, ?, ?, ?)',
          [result.insertId, item.producto_id, item.cantidad, item.precio]
        );
      }
      await conn.commit();
      res.status(201).json({ success: true, orden: numero_orden });
    } catch (error) {
      await conn.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      conn.release();
    }
  }

  // FUNCIONALIDAD DE ALERTA: Envío de correo electrónico
  async enviarAlertaStock(producto) {
    const mailOptions = {
      from: `"Sistema Inventario" <${process.env.EMAIL_USER}>`,
      to: 'admin@inventario.com', // Dirección del administrador
      subject: `⚠️ ALERTA CRÍTICA: Stock Bajo en ${producto.nombre}`,
      text: `El producto ${producto.nombre} (ID: ${producto.id}) ha alcanzado un nivel crítico.\n\n` +
            `Stock Actual: ${producto.stock_actual}\n` +
            `Stock Mínimo: ${producto.stock_minimo}\n\n` +
            `Por favor, genere una nueva Orden de Compra.`
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[ALERTA] Email enviado: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[ALERTA ERROR] Fallo al enviar email:', error.message);
      return false; // Retorna false pero permite que la API responda éxito en stock
    }
  }
}

module.exports = ProductosController;