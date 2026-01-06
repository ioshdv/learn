const { Sequelize } = require('sequelize');
const { DB_NAME_TEST, DB_USER_TEST, DB_PASSWORD_TEST, DB_HOST_TEST } = process.env;

// Conexión a la DB de test
const sequelize = new Sequelize(DB_NAME_TEST, DB_USER_TEST, DB_PASSWORD_TEST, {
  host: DB_HOST_TEST,
  dialect: 'postgres',
  logging: false,
});

// Importar tus modelos aquí
const User = require('../../src/models/user');
const Order = require('../../src/models/order');
const Product = require('../../src/models/product');
const Payment = require('../../src/models/payment');

async function setupDatabase() {
  try {
    // sincroniza todos los modelos y fuerza la recreación de tablas
    await sequelize.sync({ force: true });
    console.log('✅ Database sincronizada');
  } catch (err) {
    console.error('❌ Error al sincronizar DB:', err);
    throw err;
  }
}

async function closeDatabase() {
  await sequelize.close();
  console.log('✅ Conexión cerrada');
}

module.exports = {
  sequelize,
  setupDatabase,
  closeDatabase,
  models: { User, Order, Product, Payment },
};
