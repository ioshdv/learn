const router = require('express').Router();
const postsCtrl = require('../controllers/postsController');
const commentsCtrl = require('../controllers/commentsController'); // Importación necesaria
const { authenticate, authorize } = require('../middleware/auth');

// DASHBOARD
router.get('/posts/stats', authenticate, authorize('admin'), postsCtrl.getStats);

// BUSQUEDA Y LISTADO
router.get('/posts', postsCtrl.getPosts);

// ACCIONES
router.post('/posts', authenticate, authorize('admin', 'author'), postsCtrl.createPost);
router.post('/posts/:id/vote', authenticate, postsCtrl.votePost);

// Se usa commentsCtrl para la creación de comentarios
router.post('/posts/:postId/comments', authenticate, commentsCtrl.createComment);

router.delete('/posts/:id', authenticate, authorize('admin'), postsCtrl.deletePost);

module.exports = router;