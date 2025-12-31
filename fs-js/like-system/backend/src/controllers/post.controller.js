let posts = [
  { id: 1, title: "Post 1", likes: 7 },
  { id: 2, title: "Post 2", likes: 4 },
];

const getPosts = (req, res) => {
  res.json(posts);
};

const likePost = (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ error: "Post no encontrado" });
  }

  posts[postIndex].likes += 1;
  res.json(posts[postIndex]);
};

const sendContact = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  console.log("Contacto recibido:", { name, email, message });

  res.status(201).json({ 
    message: "¡Confirmación de envío exitoso!",
    received: { name, email } 
  });
};

// EXPORTACIÓN COMPLETA - Asegúrate de que los nombres coincidan exactamente
module.exports = {
  getPosts,
  likePost,
  sendContact
};