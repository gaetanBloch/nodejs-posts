const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// PUT /auth/signup
router.put('/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(user => {
            if (user) {
              return Promise.reject('E-Mail address already in use.');
            }
          });
      }),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().notEmpty()
  ], authController.signup);

// POST /auth/login
router.post('/login', authController.login);

// GET /users/id/status
router.get('/status', isAuth, authController.getUserStatus);

// PUT /users/id/status
router.patch('/status',
  isAuth, [
  body('status').trim().notEmpty()
], authController.updateUserStatus);

module.exports = router;
