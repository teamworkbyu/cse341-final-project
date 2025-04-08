const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { validateUser } = require('../middlewares/validation');

const { isAuthenticated } = require('../middlewares/auth');

// Define routes for users
router.get('/', isAuthenticated, usersController.getUsers);
router.get('/:id', isAuthenticated, usersController.getUserById);
router.post('/', isAuthenticated, validateUser, usersController.createUser);
router.put('/:id', isAuthenticated, validateUser, usersController.updateUser);
router.delete('/:id', isAuthenticated, usersController.deleteUser);

module.exports = router;