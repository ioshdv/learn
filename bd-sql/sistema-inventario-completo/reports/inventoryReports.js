class InventoryReports {
  constructor(db) {
    this.db = db;
  }

  // Genera datos agregados para la sincronización con ERP
  async getValoracionInventario() {
    try {
      const [rows] = await this.db.query(`
        SELECT 
          SUM(stock_actual * precio_compra) as costo_total,
          SUM(stock_actual * precio_venta) as pvp_total,
          COUNT(id) as sku_count,
          SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) as productos_en_alerta
        FROM productos 
        WHERE activo = 1
      `);
      
      // Asegurar que los valores nulos se retornen como 0
      return {
        costo_total: rows[0].costo_total || 0,
        pvp_total: rows[0].pvp_total || 0,
        sku_count: rows[0].sku_count || 0,
        productos_en_alerta: rows[0].productos_en_alerta || 0
      };
    } catch (error) {
      throw new Error('Error al generar reporte de valoración: ' + error.message);
    }
  }

  // Reporte de rotación para integración de Business Intelligence
  async getBajoStock() {
    const [rows] = await this.db.query(`
      SELECT p.nombre, p.stock_actual, p.stock_minimo, prov.nombre as proveedor
      FROM productos p
      JOIN proveedores prov ON p.proveedor_id = prov.id
      WHERE p.stock_actual <= p.stock_minimo
    `);
    return rows;
  }
}

module.exports = InventoryReports;