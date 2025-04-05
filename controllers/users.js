const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;

// Get all users
const getUsers = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const users = await db.collection('users').find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const userId = req.params.id;
    const user = await db.collection('users').findOne({ _id: ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })
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
<<<<<<< HEAD

    const response = await mongodb.getDatabase().db().collection('users').insertOne(user);
=======
    const db = mongodb.getDatabase();
    const response = await db.collection('users').insertOne(user);
>>>>>>> 0f99f7afb6e624a5e6e6f4d534d73784becd2f5d

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
    const db = mongodb.getDatabase();
    const userId = req.params.id;
    const updatedUser = {
      name: req.body.name,
      email: req.body.email,
      favoriteColor: req.body.favoriteColor,
      age: req.body.age,
      title: req.body.title,
      birthDate: req.body.birthDate,
      birthPlace: req.body.birthPlace,
    };

    const response = await db.collection('users').updateOne({ _id: ObjectId(userId) }, { $set: updatedUser });

    if (response.modifiedCount > 0) {
      return res.status(200).json({ message: "User updated successfully.", updatedUser });
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const userId = req.params.id;
    const response = await db.collection('users').deleteOne({ _id: ObjectId(userId) });

    if (response.deletedCount > 0) {
      return res.status(200).json({ message: "User deleted successfully." });
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
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