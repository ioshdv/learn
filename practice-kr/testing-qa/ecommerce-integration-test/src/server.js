const app = require('./app');
const sequelize = require('./models/index');

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});
