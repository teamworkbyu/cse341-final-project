// tests/categories.test.js
const request = require('supertest');
const express = require('express');
const mongodb = require('../config/database');
const categoriesController = require('../controllers/categories');
const { ObjectId } = require('mongodb');

jest.mock('../config/database');

const app = express();
app.use(express.json());

// Setup routes
app.get('/categories', categoriesController.getCategories);
app.get('/categories/:id', categoriesController.getCategoryById);
app.post('/categories', categoriesController.createCategory);
app.put('/categories/:id', categoriesController.updateCategory);
app.delete('/categories/:id', categoriesController.deleteCategory);

describe('Categories API', () => {
    beforeEach(() => {
        mongodb.getDatabase.mockClear(); // Clears mocks before each test
    });

    describe('GET /categories', () => {
        it('should return all categories', async () => {
            const mockCategories = [
                { _id: new ObjectId('507f191e810c19729de860ea'), name: 'Category 1', description: 'First category', individualName: 'Individual 1' },
                { _id: new ObjectId('507f191e810c19729de860eb'), name: 'Category 2', description: 'Second category', individualName: 'Individual 2' }
            ];

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        find: jest.fn().mockReturnValue({
                            toArray: jest.fn().mockResolvedValue(mockCategories)
                        })
                    })
                })
            });

            const response = await request(app).get('/categories');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCategories.map(cat => ({
                _id: cat._id.toString(),
                name: cat.name,
                description: cat.description,
                individualName: cat.individualName
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

            const response = await request(app).get('/categories');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Error retrieving category", error: 'Database error' });
        });
    });

    describe('GET /categories/:id', () => {
        it('should return a category by ID', async () => {
            const mockCategory = { _id: new ObjectId('507f191e810c19729de860ea'), name: 'Category 1', description: 'First category', individualName: 'Individual 1' };
            const categoryId = '507f191e810c19729de860ea';

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue(mockCategory)
                    })
                })
            });

            const response = await request(app).get(`/categories/${categoryId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                _id: mockCategory._id.toString(),
                name: mockCategory.name,
                description: mockCategory.description,
                individualName: mockCategory.individualName
            });
        });

        it('should return 404 if category not found', async () => {
            const categoryId = '507f191e810c19729de860ea';

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue(null)
                    })
                })
            });

            const response = await request(app).get(`/categories/${categoryId}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Category not found." });
        });

        it('should return 500 for invalid ID format', async () => {
            const invalidId = 'invalid_id_format';

            const response = await request(app).get(`/categories/${invalidId}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Invalid ID format or server error.", error: expect.any(String) });
        });
    });

    describe('POST /categories', () => {
        it('should create a new category', async () => {
            const newCategory = { name: 'New Category', description: 'A new category', individualName: 'New Individual' };

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        insertOne: jest.fn().mockResolvedValue({ acknowledged: true })
                    })
                })
            });

            const response = await request(app).post('/categories').send(newCategory);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                message: "category created successfully.",
                category: newCategory
            });
        });

        it('should return 500 if creation fails', async () => {
            const newCategory = { name: 'New Category', description: 'A new category', individualName: 'New Individual' };

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        insertOne: jest.fn().mockResolvedValue({ acknowledged: false })
                    })
                })
            });

            const response = await request(app).post('/categories').send(newCategory);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Failed to create category." });
        });
    });

    describe('PUT /categories/:id', () => {
        it('should update a category by ID', async () => {
            const updatedCategory = { name: 'Updated Category', description: 'An updated category', individualName: 'Updated Individual' };
            const categoryId = '507f191e810c19729de860ea';

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
                    })
                })
            });

            const response = await request(app).put(`/categories/${categoryId}`).send(updatedCategory);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Category updated successfully." });
        });

        it('should return 404 if category not found for update', async () => {
            const updatedCategory = { name: 'Updated Category', description: 'An updated category', individualName: 'Updated Individual' };
            const categoryId = '507f191e810c19729de860ea';

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 })
                    })
                })
            });

            const response = await request(app).put(`/categories/${categoryId}`).send(updatedCategory);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "No changes made or country not found." });
        });
    });

    describe('DELETE /categories/:id', () => {
        it('should delete a category by ID', async () => {
            const categoryId = '507f191e810c19729de860ea';

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
                    })
                })
            });

            const response = await request(app).delete(`/categories/${categoryId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: "Category deleted successfully." });
        });

        it('should return 404 if category not found for delete', async () => {
            const categoryId = '507f191e810c19729de860ea';

            mongodb.getDatabase.mockReturnValue({
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 })
                    })
                })
            });

            const response = await request(app).delete(`/categories/${categoryId}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Category not found or already deleted." });
        });
    });
});
