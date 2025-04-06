const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Get all tasks
const getComments = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('comments').find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks", error: error.message });
  }
};

// Get task by ID
const getCommentById = async (req, res) => {
  try {
    const commentId = new ObjectId(req.params.id);
    const comment = await mongodb.getDatabase().db().collection('comments').findOne({ _id: commentId });
    if (!user) return res.status(404).json({ message: "Comment not found." });
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID or server error", error: error.message });
  }
};

// Register (create new task with hashed password)
const register = async (req, res) => {
  try {
    const { description, completion } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const comment = {
      description,
      completion,
      password: hashedPassword,
    };

    const db = mongodb.getDatabase().db();
    const existingComment = await db.collection('comments').findOne({ email });
    if (existingComment) return res.status(409).json({ message: "Comment already exists." });

    const response = await db.collection('comments').insertOne(comment);
    if (response.acknowledged) {
      return res.status(201).json({ message: "Comment registered successfully." });
    } else {
      return res.status(500).json({ message: "Comment registration failed." });
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
    const user = await db.collection('comments').findOne({ email });

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
const updateComment = async (req, res) => {
  try {
    const commentId = new ObjectId(req.params.id);
    const updatedComment = {
      description: req.body.description,
      completion: req.body.completion
    };

    const response = await mongodb.getDatabase().db().collection('comments').updateOne(
      { _id: commentId },
      { $set: updatedComment }
    );

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "Comment updated successfully." });
    } else {
      return res.status(404).json({ message: "No changes made or comment not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update comment.", error: error.message });
  }
};

// Delete task
const deleteComment = async (req, res) => {
  try {
    const commentId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('comments').deleteOne({ _id: commentId });

    if (response.deletedCount > 0) {
      return res.status(200).json({ message: "Comment deleted successfully." });
    } else {
      return res.status(404).json({ message: "Comment not found or already deleted." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment.", error: error.message });
  }
};

module.exports = {
  getComments,
  getCommentById,
  register,
  login,
  updateComment,
  deleteComment
};
