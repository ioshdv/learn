require('dotenv').config();
const { sequelize } = require('./src/models');

async function init() {
  try {
    console.log('Conexión a la DB de test...');
    await sequelize.authenticate();
    console.log('Conexión a la DB de test OK');

    console.log('Sincronizando DB de test...');
    await sequelize.sync({ force: true });
    console.log('DB de test sincronizada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error inicializando DB de test:', error);
    process.exit(1);
  }
}

init();
