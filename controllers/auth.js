const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../constants');

const { forwardError, throwError, validate } = require('./utils');

const checkUser = (user, userId) => {
  if (!user) {
    throwError('The user could not be found for id = ' + userId);
  }
};

exports.signup = async (req, res, next) => {
  validate(req);

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    const savedUser = await user.save();
    res.status(201).json({
      message: 'User created successfully.',
      userId: savedUser._id
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throwError('The email address does not belong to any user.', 401);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throwError('The password does not match the email address', 401);
    }
    const token = jwt.sign({
        email: user.email,
        userId: user._id.toString()
      },
      TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.getUserStatus = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    checkUser(user, userId);
    res.status(200).json({
      message: 'Status fetched successfully ',
      status: user.status
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  validate(req);

  const userId = req.userId;
  const status = req.body.status;
  try {
    const user = await User.findById(userId);
    checkUser(user, userId);
    user.status = status;
    const result = await user.save();
    res.status(200).json({
      message: 'User status updated successfully.',
      status: result.status
    });
  } catch (err) {
    forwardError(err, next);
  }
};

