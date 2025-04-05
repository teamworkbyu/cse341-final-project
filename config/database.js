// These files are subject to change as assigned to task owner
const dotenv = require('dotenv');
dotenv.config();

const MongoClient = require('mongodb').MongoClient;

let database;

const initDb = (callback) => {
  if (database) {
    console.log('DB is already initialized');
    return callback(null, database);
  }

  MongoClient.connect(process.env.MONGODB_URL)
    .then((client) => {
      database = client;
      callback(null, database);
    })
    .catch((err) => {
      console.error('Failed to connect to database');
      callback(err);
    });
};

const getDatabase = () => {
  if (!database) {
    throw Error('Database has not been initialized. Please call init first.');
  }
  return database;
};

module.exports = {
  initDb,
  getDatabase,
};
