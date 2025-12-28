const storage = require('../config/database');
const { v4: uuid } = require('uuid');
const emailService = require('../utils/emailService');

exports.createComment = (req, res) => {
    const data = storage.get();
    const { postId } = req.params;
    
    const post = data.posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });

    const comment = { 
        id: uuid(), 
        postId, 
        username: req.user.username,
        content: req.body.content, 
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    data.comments.push(comment);
    storage.save(data);
    res.status(201).json(comment);
};

exports.approveComment = (req, res) => {
    const data = storage.get();
    const comment = data.comments.find(c => c.id === req.params.id);
    
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    
    comment.status = 'approved';
    storage.save(data);

    // Simulación de notificación al autor del comentario o post
    emailService.sendNotification(
        'usuario@ejemplo.com', 
        'Comentario Aprobado', 
        `Tu comentario "${comment.content}" ha sido aprobado.`
    );

    res.json({ message: 'Comentario aprobado', comment });
};