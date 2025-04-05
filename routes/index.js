const passport = require('passport');
const { isAuthenticated } = require('../middlewares/auth');

const router = require('express').Router();

router.use('/', require('./swagger'));
router.use('/categories', isAuthenticated, require('./categories'));
router.use('/tasks', isAuthenticated, require('./tasks'));
router.use('/users', isAuthenticated, require('./users'));
router.use('/comments', isAuthenticated, require('./comments'));


router.get('/', (req, res) => {
  res.send('Hello! Welcome to our Task Management API. Please login to access the API.');
});

router.get('/login', passport.authenticate('github'), (req, res) => {});

router.get('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {return next(err);}
    res.redirect('/');
  });
  });

module.exports = router;