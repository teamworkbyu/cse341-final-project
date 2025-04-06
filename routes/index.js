const passport = require('passport');
const { isAuthenticated } = require('../middlewares/auth');

const router = require('express').Router();

router.use('/', require('./swagger'));

router.use('/categories', isAuthenticated, require('./categories'));
router.use('/tasks', isAuthenticated, require('./tasks'));
router.use('/users', isAuthenticated, require('./users'));
router.use('/comments', isAuthenticated, require('./comments'));


router.get('/login', passport.authenticate('github'), (req, res) => { });

router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/?message=You have been Logged out successfully');
  });
});


module.exports = router;