// These files are subject to change as assigned to task owner
const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const tasks = await db.collection('tasks').find({}).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const taskId = req.params.id;
    const task = await db.collection('tasks').findOne({ _id: ObjectId(taskId) });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })
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

    const db = mongodb.getDatabase();
    const response = await db.collection('tasks').insertOne(task);

    if (response.acknowledged) {
      return res.status(201).json({ message: "Task created successfully.", task });
    } else {
      return res.status(500).json({ message: "Failed to create task." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
};

// Update a task by ID
const updateTask = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const taskId = req.params.id;
    const updatedTask = {
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
    };

    const response = await db.collection('tasks').updateOne(
      { _id: ObjectId(taskId) },
      { $set: updatedTask }
    );

    if (response.modifiedCount === 0) {
      return res.status(404).json({ error: 'Task not found or no changes made' });
    }
    res.status(200).json({ message: 'Task updated successfully', updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const taskId = req.params.id;
    const response = await db.collection('tasks').deleteOne({ _id: ObjectId(taskId) });
    if (response.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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