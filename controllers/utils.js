const { validationResult } = require('express-validator');

const forwardError = (err, next) => {
  if (err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const throwValidationErrors = (message, statusCode, errors) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = errors.array();
  throw error;
};

const validate = req => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwValidationErrors(
      'Validation failed: Entered data is incorrect.',
      422,
      errors
    );
  }
};

exports.forwardError = forwardError;
exports.throwError = throwError;
exports.validate = validate;
