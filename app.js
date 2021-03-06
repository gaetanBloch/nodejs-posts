const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
}

// Multer Configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, Date.now() + '-' + name + '.' + ext);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

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
    'Origin, X-requested-With, Content-Type, Authorization'
  );
  next();
});

// Set up Routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

// Middleware to handling Errors
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

module.exports = app;
