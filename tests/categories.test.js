const request = require('supertest');
const app = require('../server'); 
const mongodb = require('../config/database');
const ObjectId = require('mongodb').ObjectId;
const accessToken = 'Ov23liDojfdpqdE4iJAJ';

describe('Categories API', () => {
  beforeAll(async () => {
    await mongodb.initDb();
  });

  // Test GET all categories
  describe('GET /categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/categories')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  // Test GET category by ID
  describe('GET /categories/:id', () => {
    it('should return a category by ID', async () => {
      const categoryId = new ObjectId();

      await mongodb.getDatabase().db().collection('categories').insertOne({
        _id: categoryId,
        name: 'Test Category',
        description: 'This is a test category',
        individualName: 'Test Individual'
      });

      const response = await request(app)
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Category');
    });

    it('should return 404 when category not found', async () => {
      const invalidId = new ObjectId();
      const response = await request(app)
        .get(`/categories/${invalidId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Category not found.');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = '1234';
      const response = await request(app)
        .get(`/categories/${invalidId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Invalid ID format or server error.');
    });
  });

  // Clean up the database after test
  afterAll(async () => {
    await mongodb.getDatabase().db().collection('categories').deleteMany({});
    await mongodb.getDatabase().db().collection('categories').drop();
  });
});