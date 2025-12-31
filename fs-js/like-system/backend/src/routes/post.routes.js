const express = require("express");
const router = express.Router();

// Importamos desestructurando para asegurar que las funciones existan
const { getPosts, likePost, sendContact } = require("../controllers/post.controller");

/**
 * REQUERIMIENTO: Endpoints de comunicación
 * Si alguna de estas variables es undefined, Express lanzará el error que viste.
 */

// Obtener posts
router.get("/", getPosts);

// Incrementar likes
router.post("/:id/like", likePost);

// Enviar formulario de contacto
router.post("/contact", sendContact);

module.exports = router;