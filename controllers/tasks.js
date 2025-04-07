const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('tasks').find().toArray();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks", error: error.message });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const taskId = new ObjectId(req.params.id);
    const task = await mongodb.getDatabase().db().collection('tasks').findOne({ _id: taskId });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID or server error", error: error.message });
  }
};

// Register (create new task with hashed password)
const register = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const task = {
      title,
      description,
      status,
      priority,
      dueDate,
      password: hashedPassword,
    };

    const db = mongodb.getDatabase().db();
    const existingTask = await db.collection('tasks').findOne({ email });
    if (existingTask) return res.status(409).json({ message: "Task already exists." });

    const response = await db.collection('tasks').insertOne(task);
    if (response.acknowledged) {
      return res.status(201).json({ message: "Task registered successfully." });
    } else {
      return res.status(500).json({ message: "Task registration failed." });
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
    const user = await db.collection('tasks').findOne({ email });

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
const updateTask = async (req, res) => {
  try {
    const taskId = new ObjectId(req.params.id);
    const updatedTask = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate
    };

    const response = await mongodb.getDatabase().db().collection('tasks').updateOne(
      { _id: taskId },
      { $set: updatedTask }
    );

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "Task updated successfully." });
    } else {
      return res.status(404).json({ message: "No changes made or task not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update task.", error: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const taskId = new ObjectId(req.params.id);
    const response = await mongodb.getDatabase().db().collection('tasks').deleteOne({ _id: taskId });

    if (response.deletedCount > 0) {
      return res.status(200).json({ message: "Task deleted successfully." });
    } else {
      return res.status(404).json({ message: "Task not found or already deleted." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task.", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  register,
  login,
  updateTask,
  deleteTask
};
