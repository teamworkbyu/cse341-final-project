const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Task Management API',
    description: 'API documentation for the Task Management API'
  },
  host: 'cse341-final-project-dj1x.onrender.com',
  schemes: ['https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter JWT token like: **Bearer &lt;token&gt;**'
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Categories', description: 'Endpoints for managing categories' },
    { name: 'Tasks', description: 'Endpoints for managing tasks' },
    { name: 'Users', description: 'Endpoints for managing users' },
    { name: 'Comments', description: 'Endpoints for managing comments' }
  ]
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
