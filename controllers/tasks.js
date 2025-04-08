// These files are subject to change as assigned to task owner
const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('tasks').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks", error: error.message });
  }
}

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const database = mongodb.getDatabase();
    const db = database.db();
    const taskId = req.params.id;

    if (!ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format." });
    }

    const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID format or server error.", error: error.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const task = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
    };

    const response = await mongodb.getDatabase().db().collection('tasks').insertOne(task);

    if (response.acknowledged) {
      return res.status(201).json({ message: "Task created successfully.", task });
    } else {
      return res.status(500).json({ message: "Failed to create task." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  try {
    const taskId = new ObjectId(req.params.id);
    const task = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
    };

    const response = await mongodb.getDatabase().db().collection('tasks').updateOne(
      { _id: taskId },
      { $set: task }
    );

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "task updated successfully." });
    } else {
      return res.status(404).json({ message: "No changes made or task not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update task.", error: error.message });
  }
};

// Delete a task by ID
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

// Exporting the functions to be used in routes
module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};