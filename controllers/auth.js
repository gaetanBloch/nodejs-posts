const User = require('../models/user');
const bcrypt = require('bcryptjs');

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
      })
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'User created successfully.',
        userId: result._id
      })
    })
    .catch(err => forwardError(err));
};
