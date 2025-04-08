const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating category
const validateCategory = [
    body('name').notEmpty().withMessage('name is required'),
    body('description').notEmpty().withMessage('description is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation rules for creating/updating a task
const validateTask = [
    body('title').notEmpty().withMessage('title is required'),
    body('description').notEmpty().withMessage('description is required'),
    body('status').notEmpty().withMessage('status is required'),
    body('priority').notEmpty().withMessage('priority is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation rules for creating/updating a user
const validateUser = [
    body('name').notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('age').isInt({ min: 0 }).withMessage('Age must be a positive integer'),
    body('favoriteColor').notEmpty().withMessage('favoriteColor is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation rules for creating/updating a comment
const validateComment = [
    body('description').notEmpty().withMessage('description is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateCategory, validateTask, validateUser, validateComment };