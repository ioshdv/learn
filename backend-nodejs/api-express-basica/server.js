const express = require('express');
const morgan = require('morgan');
const tareasRoutes = require('./routes/tareas.routes');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Prefijo /tareas para todas las rutas definidas en tareas.routes.js
app.use('/tareas', tareasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});