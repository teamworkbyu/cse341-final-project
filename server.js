require('dotenv').config();
const express = require('express');
const mongodb = require('./config/database');
const e = require('express');
const app = express();
const BodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { body } = require('express-validator');
const bodyParser = require('body-parser');
const GitHubStrategy = require('passport-github').Strategy;
const cors = require('cors');


const PORT = process.env.PORT || 8000;

app.use(express.json()); 
app
  .use(bodyParser.json())
  .use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: false,
        maxAge: 14 * 24 * 60 * 60 * 1000
    }
  }))
  // Basic express initialization
  .use(passport.initialize())
  
  .use(passport.session())
  
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

app.get('/', (req, res) => {
  let message = req.query.message;
  let loginMessage = req.session.user !== undefined
      ? `You are now logged in as ${req.session.user.displayName}`
      : "👋Hello! Welcome to our Task Management API. Please login to access the API.";
  res.send(`
      <div>
          ${loginMessage}
          ${message ? `<div>${message}</div>` : ''}
      </div>
  `);
});

app.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'api-docs', session: false }), 
  (req, res) => {
      req.session.user = {
          id: req.user.id, 
          displayName: req.user.displayName || req.user.username || req.user.name
      };
      res.redirect('/');
  }
);

mongodb.initDb((err) => {
  if (err) {
      console.error("❌ Failed to connect to database:", err);
  } else {
      console.log("✅ Database initialized successfully");
      
      // Start Server
      app.listen(PORT, () => {
          console.log(`🚀 Server is running on Port ${PORT}`);
      });
  }
});