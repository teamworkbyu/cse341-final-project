const request = require('supertest');
const express = require('express');
const mongodb = require('../config/database');
const tasksController = require('../controllers/tasks');
const { ObjectId } = require('mongodb');

jest.mock('../config/database');

const app = express();
app.use(express.json());

// Setup routes
app.get('/tasks', tasksController.getTasks);
app.get('/tasks/:id', tasksController.getTaskById);
app.post('/tasks', tasksController.createTask);
app.put('/tasks/:id', tasksController.updateTask);
app.delete('/tasks/:id', tasksController.deleteTask);

describe('Tasks API', () => {
  beforeEach(() => {
    mongodb.getDatabase.mockClear(); // Clear mocks before tests
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        { _id: new ObjectId('507f191e810c19729de860ea'), title: 'Task 1', description: 'Description 1', status: 'pending', priority: 'high', dueDate: '2025-04-15' },
        { _id: new ObjectId('507f191e810c19729de860eb'), title: 'Task 2', description: 'Description 2', status: 'completed', priority: 'medium', dueDate: '2025-04-20' }
      ];

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockTasks)
            })
          })
        })
      });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks.map(task => ({
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
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

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Error retrieving tasks", error: 'Database error' });
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by ID', async () => {
      const mockTask = { _id: new ObjectId('507f191e810c19729de860ea'), title: 'Task 1', description: 'Description 1', status: 'pending', priority: 'high', dueDate: '2025-04-15' };
      const taskId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(mockTask)
          })
        })
      });

      const response = await request(app).get(`/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: mockTask._id.toString(),
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
        priority: mockTask.priority,
        dueDate: mockTask.dueDate
      });
    });

    it('should return 404 if task not found', async () => {
      const taskId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null)
          })
        })
      });

      const response = await request(app).get(`/tasks/${taskId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Task not found." });
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid_id_format';

      const response = await request(app).get(`/tasks/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid task ID format." });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'New Task', description: 'New Description', status: 'pending', priority: 'high', dueDate: '2025-04-15' };

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue({ acknowledged: true })
          })
        })
      });

      const response = await request(app).post('/tasks').send(newTask);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Task created successfully.",
        task: newTask
      });
    });

    it('should return 500 if creation fails', async () => {
      const newTask = { title: 'New Task', description: 'New Description', status: 'completed', priority: 'medium', dueDate: '2025-04-20' };

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            insertOne: jest.fn().mockResolvedValue({ acknowledged: false })
          })
        })
      });

      const response = await request(app).post('/tasks').send(newTask);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to create task." });
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task by ID', async () => {
      const updatedTask = { title: 'Updated Task', description: 'Updated Description', status: 'completed', priority: 'low', dueDate: '2025-04-25' };
      const taskId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
          })
        })
      });

      const response = await request(app).put(`/tasks/${taskId}`).send(updatedTask);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "task updated successfully." });
    });

    it('should return 404 if task not found for update', async () => {
      const updatedTask = { title: 'Updated Task', description: 'Updated Description', status: 'completed', priority: 'low', dueDate: '2025-04-25' };
      const taskId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
          })
        })
      });

      const response = await request(app).put(`/tasks/${taskId}`).send(updatedTask);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No changes made or task not found." });
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task by ID', async () => {
      const taskId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
          })
        })
      });

      const response = await request(app).delete(`/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Task deleted successfully." });
    });

    it('should return 404 if task not found for delete', async () => {
      const taskId = '507f191e810c19729de860ea';

      mongodb.getDatabase.mockReturnValue({
        db: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
          })
        })
      });

      const response = await request(app).delete(`/tasks/${taskId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Task not found or already deleted." });
    });
  });
});