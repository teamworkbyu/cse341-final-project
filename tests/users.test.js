const request = require('supertest');
const express = require('express');
const mongodb = require('../config/database');
const usersController = require('../controllers/users');
const { ObjectId } = require('mongodb');

jest.mock('../config/database');

const app = express();
app.use(express.json());

// Setup routes
app.get('/users', usersController.getUsers);
app.get('/users/:id', usersController.getUserById);
app.post('/users', usersController.createUser);
app.put('/users/:id', usersController.updateUser);
app.delete('/users/:id', usersController.deleteUser);

describe('Users API', () => {
  beforeEach(() => {
    mongodb.getDatabase.mockClear(); // This clears mocks before test
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: new ObjectId('507f191e810c19729de860ea'), name: 'User 1', email: 'user1@example.com', favoriteColor: 'blue', age: 25, title: 'Developer', birthDate: '1998-01-01', birthPlace: 'City A' },
        { _id: new ObjectId('507f191e810c19729de860eb'), name: 'User 2', email: 'user2@example.com', favoriteColor: 'red', age: 30, title: 'Designer', birthDate: '1993-01-01', birthPlace: 'City B' }
      ];

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockUsers)
            })
          })
        })
      });

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        favoriteColor: user.favoriteColor,
        age: user.age,
        title: user.title,
        birthDate: user.birthDate,
        birthPlace: user.birthPlace
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

      const response = await request(app).get('/users');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Error retrieving countries", error: 'Database error' });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const mockUser = { _id: new ObjectId('507f191e810c19729de860ea'), name: 'User 1', email: 'user1@example.com', favoriteColor: 'blue', age: 25, title: 'Developer', birthDate: '1998-01-01', birthPlace: 'City A' };
      const userId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(mockUser)
          })
        })
      });

      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: mockUser._id.toString(),
        name: mockUser.name,
        email: mockUser.email,
        favoriteColor: mockUser.favoriteColor,
        age: mockUser.age,
        title: mockUser.title,
        birthDate: mockUser.birthDate,
        birthPlace: mockUser.birthPlace
      });
    });

    it('should return 404 if user not found', async () => {
      const userId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
          })
        })
      });

      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found." });
    });

    it('should return 500 for invalid ID format', async () => {
      const invalidId = 'invalid_id_format';

      const response = await request(app).get(`/users/${invalidId}`);

      expect(response.status).toBe(500); // Because of invalid ObjectId will not be caught
      expect(response.body).toEqual({ message: "Invalid ID format or server error.", error: expect.any(String) });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'New User', email: 'newuser@example.com', favoriteColor: 'green', age: 28, title: 'Manager', birthDate: '1995-01-01', birthPlace: 'City C' };

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue({ acknowledged: true })
          })
        })
      });

      const response = await request(app).post('/users').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "User created successfully.",
        user: newUser
      });
    });

    it('should return 500 if creation fails', async () => {
      const newUser = { name: 'New User', email: 'newuser@example.com', favoriteColor: 'green', age: 28, title: 'Manager', birthDate: '1995-01-01', birthPlace: 'City C' };

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue({ acknowledged: false })
          })
        })
      });

      const response = await request(app).post('/users').send(newUser);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create user." });
    });
});


  describe('PUT /users/:id', () => {
    it('should update a user by ID', async () => {
      const updatedUser = { name: 'Updated User', email: 'updateduser@example.com', favoriteColor: 'yellow', age: 29, title: 'Senior Developer', birthDate: '1994-01-01', birthPlace: 'City D' };
      const userId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
          })
        })
      });

      const response = await request(app).put(`/users/${userId}`).send(updatedUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "user updated successfully." });
    });

    it('should return 404 if user not found for update', async () => {
      const updatedUser = { name: 'Updated User', email: 'updateduser@example.com', favoriteColor: 'yellow', age: 29, title: 'Senior Developer', birthDate: '1994-01-01', birthPlace: 'City D' };
      const userId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
          })
        })
      });

      const response = await request(app).put(`/users/${userId}`).send(updatedUser);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No changes made or user not found." });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user by ID', async () => {
      const userId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
          })
        })
      });

      const response = await request(app).delete(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "User deleted successfully." });
    });

    it('should return 404 if user not found for delete', async () => {
      const userId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
          })
        })
      });

      const response = await request(app).delete(`/users/${userId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found or already deleted." });
    });
  });
});








