const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://127.0.0.1:4000';

async function ejecutarPruebas() {
  try {
    console.log('🧪 Iniciando Pruebas Dinámicas en: ' + API_BASE);
    const emailTest = "test_" + Date.now() + "@mail.com";

    // 1. Registro
    await axios.post(`${API_BASE}/auth/register`, {
      nombre: 'User Test', email: emailTest, password: 'password123'
    });
    console.log('✅ 1. Registro OK');

    // 2. Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: emailTest, password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ 2. Login OK');

    // 3. Crear Producto Dinámico
    console.log('3. Creando Producto...');
    const dummyPath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(dummyPath, 'test content');
    
    const form = new FormData();
    form.append('nombre', 'Smartphone Dinámico ' + Date.now());
    form.append('precio', '850.00');
    form.append('imagen', fs.createReadStream(dummyPath));

    const resProd = await axios.post(`${API_BASE}/productos`, form, {
      headers: { ...form.getHeaders(), 'Authorization': 'Bearer ' + token }
    });

    // --- REPASO DE LÓGICA: Obtener el ID ---
    // Consultamos el último producto para obtener su ID real
    const listado = await axios.get(`${API_BASE}/productos`);
    const ultimoProducto = listado.data[listado.data.length - 1];
    const productoId = ultimoProducto.id;
    
    console.log(`✅ 3. Producto creado con ID: ${productoId}`);

    // 4. Agregar Reseña al producto RECIÉN creado
    console.log(`4. Agregando Reseña al producto ${productoId}...`);
    await axios.post(`${API_BASE}/productos/${productoId}/resenas`, {
      calificacion: 5,
      comentario: 'Esta reseña es para el producto dinámico.'
    }, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('✅ 4. Reseña vinculada correctamente');

    // 5. Pedido + Email
    await axios.post(`${API_BASE}/pedidos`, { total: 850.00 }, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    console.log('✅ 5. Pedido y Email OK');

    if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
    console.log('\n🎉 ¡PRUEBA DINÁMICA FINALIZADA!');

  } catch (error) {
    console.error('\n❌ ERROR:', error.response ? error.response.data : error.message);
  }
}

ejecutarPruebas();