const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../constants');

const { forwardError, validate } = require('./utils');

exports.signup = async (req, res, next) => {
  validate(req, next);

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
      return forwardError(
        'The email address does not belong to any user.',
        next,
        401
      );
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return forwardError(
        'The password does not match the email address',
        next,
        401
      );
    }
    const token = jwt.sign({
        email: user.email,
        userId: user._id.toString()
      },
      TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token,
      userId: user._id.toString(),
      expiresIn: 3600
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.getUserStatus = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return forwardError(
        'The user could not be found for id = ' + userId,
        next,
        404
      );
    }
    res.status(200).json({
      message: 'Status fetched successfully ',
      status: user.status
    });
  } catch (err) {
    forwardError(err, next);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  validate(req, next);

  const userId = req.userId;
  const status = req.body.status;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return forwardError(
        'The user could not be found for id = ' + userId,
        next,
        404
      );
    }
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

