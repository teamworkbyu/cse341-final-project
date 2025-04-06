require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongodb = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/', require('./routes/index'));

// Root route
app.get('/', (req, res) => {
  res.send("👋 Welcome to the Task Management API! Please login with your credentials to get a JWT.");
});

// Database connection & server start
mongodb.initDb((err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err);
  } else {
    console.log("✅ Database initialized successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  }
});
