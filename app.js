const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const MONGODB_URI = 'mongodb+srv://gbloch:gaetan.bloch@' +
  'cluster0-hcscb.mongodb.net/posts?retryWrites=true&w=majority';

const app = express();

// Multer Configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +  file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/svg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// Parse JSON data from incoming requests
app.use(bodyParser.json());

// Register Multer Middleware
app.use(multer({ storage, fileFilter }).single('image'));

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
app.use('/auth', authRoutes);

// Middleware to handling Errors
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDb.');
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Listening to port ${port}...`);
    });
  })
  .catch((err) => console.log(err));
