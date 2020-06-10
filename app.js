const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const feedRoutes = require('./routes/feed');

const MONGODB_URI = 'mongodb+srv://gbloch:gaetan.bloch@' +
  'cluster0-hcscb.mongodb.net/posts?retryWrites=true&w=majority';

const app = express();

// Parse JSON data from incoming requests
app.use(bodyParser.json());

// Serve static folders
app.use('/images', express.static(path.join(__dirname, 'images')));

// Set-up CORS authorization from all hosts for all response
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  next();
});

// Set up Routes
app.use('/feed', feedRoutes);

// Middleware to handling Errors
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDb.');
    app.listen(8080, () => {
      console.log('Listening to port 8080...');
    });
  })
  .catch((err) => console.log(err));
