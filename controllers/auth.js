const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../constants');

const { forwardError, throwError, validate } = require('./utils');

exports.signup = (req, res, next) => {
  validate(req);

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email,
        password: hashedPassword,
        name
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created successfully.',
        userId: result._id
      });
    })
    .catch(err => forwardError(err));
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        throwError('The email address does not belong to any user.', 401);
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        throwError('The password does not match the email address', 401);
      }
      const token = jwt.sign({
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch(err => forwardError(err, next));
};

exports.getUserStatus = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then(user => {
      if (!user) {
        throwError('The user could not be found for id = ' + userId);
      }

      res.status(200).json({
        message: 'Status fetched successfully ',
        status: user.status
      });
    }).catch(err => forwardError(err, next));
};

