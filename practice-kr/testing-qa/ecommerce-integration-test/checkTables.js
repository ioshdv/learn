require('dotenv').config();
const { sequelize, User, Order, Product, Payment } = require('./src/models');

async function checkTables() {
  try {
    await sequelize.sync({ force: false }); // solo verifica tablas, no borra nada
    console.log('Tablas sincronizadas');

    const [users, orders, products, payments] = await Promise.all([
      User.findAll(),
      Order.findAll(),
      Product.findAll(),
      Payment.findAll(),
    ]);

    console.log('Users:', users);
    console.log('Orders:', orders);
    console.log('Products:', products);
    console.log('Payments:', payments);

    await sequelize.close();
  } catch (err) {
    console.error(err);
  }
}

checkTables();
