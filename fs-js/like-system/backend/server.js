const app = require("./src/app"); // Se agrega "src/" porque ahora server.js está afuera
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});