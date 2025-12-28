const storage = require('../config/database');
const { v4: uuid } = require('uuid');

exports.getPosts = (req, res) => {
    const { posts } = storage.get();
    const { q, category } = req.query;
    let results = [...posts];

    if (q) {
        const query = q.toLowerCase();
        results = results.filter(p => 
            (p.title && p.title.toLowerCase().includes(query)) || 
            (p.content && p.content.toLowerCase().includes(query))
        );
    }
    if (category) {
        results = results.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    res.json(results);
};

exports.getStats = (req, res) => {
    const data = storage.get();
    res.json({
        totalPosts: data.posts.length,
        totalLikes: data.posts.reduce((acc, p) => acc + (p.likes || 0), 0),
        totalComments: data.comments.length,
        categorias: [...new Set(data.posts.map(p => p.category || 'General'))]
    });
};

exports.createPost = (req, res) => {
    const data = storage.get();
    const newPost = {
        id: uuid(),
        title: req.body.title || "Sin título",
        content: req.body.content || "",
        category: req.body.category || "General",
        author: req.user.username,
        likes: 0,
        createdAt: new Date().toISOString()
    };
    data.posts.push(newPost);
    storage.save(data);
    res.status(201).json(newPost);
};

exports.votePost = (req, res) => {
    const data = storage.get();
    const post = data.posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    post.likes = (post.likes || 0) + 1;
    storage.save(data);
    res.json({ message: "Voto registrado", post });
};

exports.deletePost = (req, res) => {
    const data = storage.get();
    data.posts = data.posts.filter(p => p.id !== req.params.id);
    storage.save(data);
    res.json({ message: 'Post eliminado' });
};