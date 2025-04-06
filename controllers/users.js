const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('users').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving countries", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const user = await mongodb.getDatabase().db().collection('users').findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID format or server error.", error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const user = {
      name: req.body.name,
      email: req.body.email,
      favoriteColor: req.body.favoriteColor,
      age: req.body.age,
      title: req.body.title,
      birthDate: req.body.birthDate,
      birthPlace: req.body.birthPlace,
    };
    const database = mongodb.getDatabase(); // Get the database client
    const db = database.db(); // Call db() on the client to get the Db instance
    const response = await db.collection('users').insertOne(user);

    if (response.acknowledged) {
      return res.status(201).json({ message: "User created successfully.", user });
    } else {
      return res.status(500).json({ message: "Failed to create user." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const user = {
      name: req.body.name,
      email: req.body.email,
      favoriteColor: req.body.favoriteColor,
      age: req.body.age,
      title: req.body.title,
      birthDate: req.body.birthDate,
      birthPlace: req.body.birthPlace,
    };

    const response = await mongodb.getDatabase().db().collection('users').updateOne(
      { _id: userId },
      { $set: user }
    );

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "user updated successfully." });
    } else {
      return res.status(404).json({ message: "No changes made or user not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update user.", error: error.message });
  }
};

// Delete a user by ID
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

// Export the functions to be used in routes
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};