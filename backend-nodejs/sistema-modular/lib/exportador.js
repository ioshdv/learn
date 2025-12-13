const fs = require('fs').promises;
const path = require('path');

async function exportarJSON(datos, nombreArchivo = 'export.json') {
  const ruta = path.join(__dirname, '..', 'data', nombreArchivo);
  await fs.mkdir(path.dirname(ruta), { recursive: true });
  await fs.writeFile(ruta, JSON.stringify(datos, null, 2), 'utf8');
  console.log(`💾 Datos exportados a JSON: ${ruta}`);
}

async function exportarCSV(datos, nombreArchivo = 'export.csv') {
  const ruta = path.join(__dirname, '..', 'data', nombreArchivo);
  await fs.mkdir(path.dirname(ruta), { recursive: true });

  if (!Array.isArray(datos)) throw new Error('Los datos deben ser un arreglo para CSV');

  const headers = Object.keys(datos[0] || {}).join(',');
  const filas = datos.map(obj => Object.values(obj).join(',')).join('\n');
  const contenido = [headers, filas].join('\n');

  await fs.writeFile(ruta, contenido, 'utf8');
  console.log(`💾 Datos exportados a CSV: ${ruta}`);
}

module.exports = {
  exportarJSON,
  exportarCSV
};
