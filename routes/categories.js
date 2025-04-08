const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const { validateCategory } = require('../middlewares/validation');

const { isAuthenticated } = require('../middlewares/auth');



// Define routes for categories

router.get('/', isAuthenticated, categoriesController.getCategories);
router.get('/:id', isAuthenticated, categoriesController.getCategoryById);
router.post('/', isAuthenticated, validateCategory, categoriesController.createCategory);
router.put('/:id', isAuthenticated, validateCategory, categoriesController.updateCategory);
router.delete('/:id', isAuthenticated, categoriesController.deleteCategory);

module.exports = router;