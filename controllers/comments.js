const router = require('express').Router();
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;

// Get all comments
const getComments = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const comments = await db.collection('comments').find({}).toArray();
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get comment by ID
const getCommentById = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const commentId = req.params.id;
    const comment = await db.collection('comments').findOne({ _id: ObjectId(commentId) });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' })
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const comment = {
      description: req.body.description,
      completion: req.body.completion,
    };

    const response = await mongodb.getDatabase().db().collection('comments').insertOne(comment);

    if (response.acknowledged) {
      return res.status(201).json({ message: "Comment created successfully.", comment });
    } else {
      return res.status(500).json({ message: "Failed to create comment." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
};

// Update a comment by ID
const updateComment = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const commentId = req.params.id;
    const updatedComment = {
      description: req.body.description,
      completion: req.body.completion,
    };

    const response = await db.collection('comments').updateOne(
      { _id: ObjectId(commentId) },
      { $set: updatedComment }
    );

    if (response.modifiedCount === 0) {
      return res.status(404).json({ error: 'Comment not found or no changes made' });
    }

    res.status(200).json({ message: 'Comment updated successfully', updatedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a comment by ID
const deleteComment = async (req, res) => {
  try {
    const db = mongodb.getDatabase();
    const commentId = req.params.id;
    const response = await db.collection('comments').deleteOne({ _id: ObjectId(commentId) });
    if (response.deletedCount === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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