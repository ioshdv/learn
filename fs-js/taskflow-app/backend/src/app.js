// backend/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const multer = require("multer");

const routes = require("./routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api", routes);

// upload errors (multer/fileFilter)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.message === "Formato de imagen no permitido" || err?.message === "Formato de archivo no permitido") {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal server error" });
});

module.exports = { app };
