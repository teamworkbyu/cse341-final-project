const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;


// Get all categories
const getCategories = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('categories').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving category", error: error.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.id);
    const category = await mongodb.getDatabase().db().collection('categories').findOne({ _id: categoryId });

    if (!category) {
        return res.status(404).json({ message: "Category not found." });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID format or server error.", error: error.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const category = {
        name: req.body.name,
        description: req.body.description,
        individualName: req.body.individualName,
    };

    const response = await mongodb.getDatabase().db().collection('categories').insertOne(category);

    if (response.acknowledged) {
        return res.status(201).json({ message: "category created successfully.", category });
    } else {
        return res.status(500).json({ message: "Failed to create category." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a category by ID
const updateCategory = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.params.id);
    const category = {
        name: req.body.name,
        description: req.body.description,
        individualName: req.body.individualName,
    };

    const response = await mongodb.getDatabase().db().collection('categories').updateOne(
        { _id: categoryId },
        { $set: category }
    );

    if (response.modifiedCount > 0) {
        return res.status(200).json({ message: "Category updated successfully." });
    } else {
        return res.status(404).json({ message: "No changes made or country not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update country.", error: error.message });
  }
};

// Delete a category by ID
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
    res.status(500).json({ message: "Failed to delete country.", error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};