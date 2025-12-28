const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commentsController');
const { authenticate, authorize } = require('../middleware/auth');

// Cualquier usuario logueado puede comentar
router.post('/posts/:postId/comments', authenticate, ctrl.createComment);

// Solo el admin puede aprobar comentarios
router.patch('/comments/:id/approve', authenticate, authorize('admin'), ctrl.approveComment);

module.exports = router;