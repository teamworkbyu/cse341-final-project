const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;


// Get all categories
const getCategories = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const categories = await db.collection('categories').find({}).toArray();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const categoryId = req.params.id;
<<<<<<< HEAD
    const category = await db.collection('categories').findOne({ _id: new ObjectId(categoryId) });
=======
    const category = await db.collection('categories').findOne({ _id: ObjectId(categoryId) });
>>>>>>> 0f99f7afb6e624a5e6e6f4d534d73784becd2f5d
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
<<<<<<< HEAD
    const category = {
      name: req.body.name,
      description: req.body.description,
      individualName: req.body.individualName,
    };

    // Access the collection directly without calling db() again
    const db = mongodb.getDatabase();
    const response = await db.collection('categories').insertOne(category);

    if (response.acknowledged) {
      return res.status(201).json({ message: "Category created successfully.", category });
    } else {
      return res.status(500).json({ message: "Failed to create category." });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Server error", error: error.message });
  }
=======
    const db = mongodb.getDatabase();
    const category = {
        name: req.body.name,
        description: req.body.description,
        individualName: req.body.individualName,
    };

    const response = await db.collection('categories').insertOne(category);

    if (response.acknowledged) {
        return res.status(201).json({ message: "category created successfully.", category });
    } else {
        return res.status(500).json({ message: "Failed to create category." });
    }
} catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
}
>>>>>>> 0f99f7afb6e624a5e6e6f4d534d73784becd2f5d
};

// Update a category by ID
const updateCategory = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const categoryId = req.params.id;
    const updatedCategory = {
      name: req.body.name,
      description: req.body.description,
      individualName: req.body.individualName,
    };
<<<<<<< HEAD
    const result = await db.collection('categories').updateOne({ _id: new ObjectId(categoryId) }, { $set: updatedCategory });
=======
    const result = await db.collection('categories').updateOne({ _id: ObjectId(categoryId) }, { $set: updatedCategory });
>>>>>>> 0f99f7afb6e624a5e6e6f4d534d73784becd2f5d
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Category not found or no changes made' });
    }
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a category by ID
const deleteCategory = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const categoryId = req.params.id;
<<<<<<< HEAD
    const result = await db.collection('categories').deleteOne({ _id: new ObjectId(categoryId) });
=======
    const result = await db.collection('categories').deleteOne({ _id: ObjectId(categoryId) });
>>>>>>> 0f99f7afb6e624a5e6e6f4d534d73784becd2f5d
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};