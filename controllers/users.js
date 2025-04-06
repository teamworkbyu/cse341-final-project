const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('users').find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const user = await mongodb.getDatabase().db().collection('users').findOne({ _id: userId });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID or server error", error: error.message });
  }
};

// Register (create new user with hashed password)
const register = async (req, res) => {
  try {
    const { name, email, password, favoriteColor, age, title, birthDate, birthPlace } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name,
      email,
      password: hashedPassword,
      favoriteColor,
      age,
      title,
      birthDate,
      birthPlace
    };

    const db = mongodb.getDatabase().db();
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) return res.status(409).json({ message: "User already exists." });

    const response = await db.collection('users').insertOne(user);
    if (response.acknowledged) {
      return res.status(201).json({ message: "User registered successfully." });
    } else {
      return res.status(500).json({ message: "User registration failed." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login and return JWT
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = mongodb.getDatabase().db();
    const user = await db.collection('users').findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const updatedUser = {
      name: req.body.name,
      email: req.body.email,
      favoriteColor: req.body.favoriteColor,
      age: req.body.age,
      title: req.body.title,
      birthDate: req.body.birthDate,
      birthPlace: req.body.birthPlace
    };

    const response = await mongodb.getDatabase().db().collection('users').updateOne(
      { _id: userId },
      { $set: updatedUser }
    );

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "User updated successfully." });
    } else {
      return res.status(404).json({ message: "No changes made or user not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update user.", error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('users').deleteOne({ _id: userId });

    if (response.deletedCount > 0) {
      return res.status(200).json({ message: "User deleted successfully." });
    } else {
      return res.status(404).json({ message: "User not found or already deleted." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user.", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  register,
  login,
  updateUser,
  deleteUser
};
