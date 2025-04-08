const request = require('supertest');
const express = require('express');
const mongodb = require('../config/database');
const commentsController = require('../controllers/comments');
const { ObjectId } = require('mongodb');

jest.mock('../config/database');

const app = express();
app.use(express.json());

// Setup routes
app.get('/comments', commentsController.getComments);
app.get('/comments/:id', commentsController.getCommentById);
app.post('/comments', commentsController.createComment);
app.put('/comments/:id', commentsController.updateComment);
app.delete('/comments/:id', commentsController.deleteComment);

describe('Comments API', () => {
  beforeEach(() => {
    mongodb.getDatabase.mockClear(); // Clear mocks before test
  });

  describe('GET /comments', () => {
    it('should return all comments', async () => {
      const mockComments = [
        { _id: new ObjectId('507f191e810c19729de860ea'), description: 'Comment 1', completion: true },
        { _id: new ObjectId('507f191e810c19729de860eb'), description: 'Comment 2', completion: false }
      ];

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockComments)
            })
          })
        })
      });

      const response = await request(app).get('/comments');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments.map(comment => ({
        _id: comment._id.toString(),
        description: comment.description,
        completion: comment.completion,
      })));
    });

    it('should return 500 on database error', async () => {
      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      });

      const response = await request(app).get('/comments');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Error retrieving comment", error: 'Database error' });
    });
  });

  describe('GET /comments/:id', () => {
    it('should return a comment by ID', async () => {
      const mockComment = { _id: new ObjectId('507f191e810c19729de860ea'), description: 'Comment 1', completion: true };
      const commentId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(mockComment)
          })
        })
      });

      const response = await request(app).get(`/comments/${commentId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: mockComment._id.toString(),
        description: mockComment.description,
        completion: mockComment.completion
      });
    });

    it('should return 404 if comment not found', async () => {
      const commentId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
          })
        })
      });

      const response = await request(app).get(`/comments/${commentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Comment not found." });
    });

    it('should return 500 for invalid ID format', async () => {
      const invalidId = 'invalid_id_format';

      const response = await request(app).get(`/comments/${invalidId}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Invalid ID format or server error.");
      expect(response.body.error).toMatch(/input must be a 24 character hex string/);
    });
  });

  describe('POST /comments', () => {
    it('should create a new comment', async () => {
      const newComment = { description: 'New Comment', completion: true };

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue({ acknowledged: true })
          })
        })
      });

      const response = await request(app).post('/comments').send(newComment);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Comment created successfully.",
        comment: newComment
      });
    });

    it('should return 500 if creation fails', async () => {
      const newComment = { description: 'New Comment', completion: false };

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue({ acknowledged: false })
          })
        })
      });

      const response = await request(app).post('/comments').send(newComment);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create comment." });
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update a comment by ID', async () => {
      const updatedComment = { description: 'Updated Comment', completion: true };
      const commentId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
          })
        })
      });

      const response = await request(app).put(`/comments/${commentId}`).send(updatedComment);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Comment updated successfully." });
    });

    it('should return 404 if comment not found for update', async () => {
      const updatedComment = { description: 'Updated Comment', completion: false };
      const commentId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
          })
        })
      });

      const response = await request(app).put(`/comments/${commentId}`).send(updatedComment);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No changes made or comment not found." });
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment by ID', async () => {
      const commentId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
          })
        })
      });

      const response = await request(app).delete(`/comments/${commentId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Comment deleted successfully." });
    });

    it('should return 404 if comment not found for delete', async () => {
      const commentId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
          })
        })
      });

      const response = await request(app).delete(`/comments/${commentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Comment not found or already deleted." });
    });
  });
});