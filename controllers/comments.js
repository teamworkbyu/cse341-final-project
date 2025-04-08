const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;

// Get all comments
const getComments = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('comments').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving comment", error: error.message });
  }
}

// Get comment by ID
const getCommentById = async (req, res) => {
  try {
    const commentId = new ObjectId(req.params.id);
    const comment = await mongodb.getDatabase().db().collection('comments').findOne({ _id: commentId });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID format or server error.", error: error.message });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const database = mongodb.getDatabase();
    const db = database.db();

    const comment = {
      description: req.body.description,
      completion: req.body.completion,
    };

    const response = await db.collection('comments').insertOne(comment);

    if (response.acknowledged) {
      return res.status(201).json({ message: "Comment created successfully.", comment });
    } else {
      return res.status(500).json({ message: "Failed to create comment." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a comment by ID
const updateComment = async (req, res) => {
  try {
    const commentId = new ObjectId(req.params.id);
    const comment = {
      description: req.body.description,
      completion: req.body.completion,
    };

    const response = await mongodb.getDatabase().db().collection('comments').updateOne(
      { _id: commentId },
      { $set: comment }
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

// Delete a comment by ID
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

// Export the functions to be used in routes
module.exports = {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
};