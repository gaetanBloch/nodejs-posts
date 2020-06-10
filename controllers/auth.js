const User = require('../models/user');

const { forwardError, throwError, validate } = require('./utils');

exports.signup = (req, res, next) => {
  validate(req);

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
};
