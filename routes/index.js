const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middlewares/auth');

// Swagger docs route (no auth)
router.use('/', require('./swagger'));

// Public auth routes (register and login)
router.use('/users', require('./users'));



// Protected routes
router.use('/categories', isAuthenticated, require('./categories'));
router.use('/tasks', isAuthenticated, require('./tasks'));
router.use('/comments', isAuthenticated, require('./comments'));

// Welcome route
// router.get('/', (req, res) => {
//   res.send('Hello! Welcome to our Task Management API. Please login to access the API.');
// });

module.exports = router;
