const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Get all tasks
const getCategories = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('categories').find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving category", error: error.message });
  }
};

// Get task by ID
const getCategoryById = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.id);
    const category = await mongodb.getDatabase().db().collection('categories').findOne({ _id: categoryId });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID or server error", error: error.message });
  }
};

// Register (create new task with hashed password)
const register = async (req, res) => {
  try {
    const { name, description, individualName} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const category = {
      name,
      description,
      individualName,
      password: hashedPassword,
    };

    const db = mongodb.getDatabase().db();
    const existingTask = await db.collection('categories').findOne({ email });
    if (existingTask) return res.status(409).json({ message: "Category already exists." });

    const response = await db.collection('categories').insertOne(category);
    if (response.acknowledged) {
      return res.status(201).json({ message: "Cotegory registered successfully." });
    } else {
      return res.status(500).json({ message: "Category registration failed." });
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
    const user = await db.collection('categories').findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Update task
const updateCategory = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.id);
    const updatedCategory = {
      name: req.body.name,
      description: req.body.description,
      individualName: req.body.individualName
    };

    const response = await mongodb.getDatabase().db().collection('categories').updateOne(
      { _id: categoryId },
      { $set: updatedCategory }
    );

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "Category updated successfully." });
    } else {
      return res.status(404).json({ message: "No changes made or category not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update category.", error: error.message });
  }
};

// Delete task
const deleteCategory = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('categories').deleteOne({ _id: categoryId });

    if (response.deletedCount > 0) {
      return res.status(200).json({ message: "Category deleted successfully." });
    } else {
      return res.status(404).json({ message: "Category not found or already deleted." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category.", error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  register,
  login,
  updateCategory,
  deleteCategory
};
