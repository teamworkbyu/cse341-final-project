const passport = require('passport');
const { isAuthenticated } = require('../middlewares/auth');

const router = require('express').Router();

router.use('/', require('./swagger'));

router.use('/categories', isAuthenticated, require('./categories'));
router.use('/tasks', isAuthenticated, require('./tasks'));
router.use('/users', isAuthenticated, require('./users'));
router.use('/comments', isAuthenticated, require('./comments'));


<<<<<<< HEAD
  router.get('/', (req, res) => {
  res.send('Hello! Welcome to our Task Management API. Please login to access the API.');
});

router.get('/login', passport.authenticate('github'), (req, res) => {});
=======
router.get('/login', passport.authenticate('github'), (req, res) => { });
>>>>>>> 32363639f2937453c4421462c73189ba3f3655b3

router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/?message=You have been Logged out successfully');
  });
});


module.exports = router;