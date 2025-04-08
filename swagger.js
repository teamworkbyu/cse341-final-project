const swaggerAutogen = require('swagger-autogen')();
const doc = {
    info: {
        title: 'Task Management API',
        description: 'API documentation for the Task Management API'
    },
    host: 'cse341-final-project-2q9o.onrender.com',
    schemes: ['https'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
