const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const { validateComment } = require('../middlewares/validation');

const { isAuthenticated } = require('../middlewares/auth');

// Define routes for comments
router.get('/', isAuthenticated, commentsController.getComments);
router.get('/:id', isAuthenticated, commentsController.getCommentById);
router.post('/', isAuthenticated, validateComment, commentsController.createComment);
router.put('/:id', isAuthenticated, validateComment, commentsController.updateComment);
router.delete('/:id', isAuthenticated, commentsController.deleteComment);

module.exports = router;