const swaggerAutogen = require('swagger-autogen')();
// These files are subject to change as assigned to task owner
const doc = {
    info: {
        title: 'Task Management API',
        description: 'API documentation for the Task Management API'
    },
    host: 'cse341-final-project-1.onrender.com',
    schemes: ['https'],
    tags: [
        {
            name: "Categories",
            description: "Endpoints for managing categories"
        },
        {
            name: "Tasks",
            description: "Endpoints for managing tasks"
        },
        {
            name: "Users",
            description: "Endpoints for managing users"
        },
        {
            name: "Comments",
            description: "Endpoints for managing comments"
        }
    ]
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
