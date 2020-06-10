const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const MONGODB_URI = 'mongodb+srv://gbloch:gaetan.bloch@' +
  'cluster0-hcscb.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();

// Parse JSON data from incoming requests
app.use(bodyParser.json());

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
})

app.use('/feed', feedRoutes);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDb.');
    app.listen(8080, () => {
      console.log('Listening to port 8080...');
    });
  })
  .catch((err) => console.log(err));
