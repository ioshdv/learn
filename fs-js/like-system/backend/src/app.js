const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Importar rutas
const postRoutes = require("./routes/post.routes");

const app = express();

/**
 * REQUERIMIENTO: Middleware de Seguridad
 * Helmet ayuda a proteger la aplicación configurando varios encabezados HTTP.
 */
app.use(helmet());

/**
 * REQUERIMIENTO: Configuración de CORS
 * Permite la comunicación exclusivamente con el origen del frontend (puerto 3000).
 */
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Lectura y parseo del cuerpo de las peticiones en formato JSON
app.use(express.json());

/**
 * REQUERIMIENTO: Definición de Rutas con prefijo /api
 */
app.use("/api/posts", postRoutes);

/**
 * REQUERIMIENTO: Manejo de rutas no encontradas (404)
 */
app.use((req, res, next) => {
  res.status(404).json({ error: "La ruta solicitada no existe" });
});

/**
 * REQUERIMIENTO: Interceptor global de errores (500)
 * Centraliza cualquier fallo del sistema para evitar caídas y dar feedback limpio.
 */
app.use((err, req, res, next) => {
  console.error("Error detectado en el servidor:", err.stack);
  res.status(500).json({ 
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "development" ? err.message : "Servicio temporalmente no disponible"
  });
});

module.exports = app;