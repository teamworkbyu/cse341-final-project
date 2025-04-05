const express = require('express');
const mongodb = require('./config/database');
const e = require('express');
const app = express();
const BodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const { body } = require('express-validator');
const bodyParser = require('body-parser');
const GitHubStrategy = require('passport-github').Strategy;
const cors = require('cors');


const PORT = process.env.PORT || 8000;

app
  .use(bodyParser.json())
  .use(session({
     secret: 'secret',
     resave: false,
     saveUninitialized: true,
  }))
  // Basic express initialization
  .use(passport.initialize())
  // Passport session initialization
  .use(passport.session())
  // Allow passport to use express sessions
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Z-key, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    next();
  })
  .use(cors({methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']}))
  .use(cors({origin: '*'}))
  .use('/', require('./routes/index'));

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Serialize user and Deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/', (req, res) => {res.send(req.session.user =! undefined ? `Logged in as ${req.session.user.displayName}` : 'Logged out')});

app.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/api-docs', session: false}),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
  });

mongodb.initDb((err) => {
  if (err) {
      console.error("❌ Failed to connect to database:", err);
  } else {
      console.log("✅ Database initialized successfully");
      
      // Start Server
      app.listen(PORT, () => {
          console.log(`🚀 Server is running on http://localhost:${PORT}`);
      });
  }
});