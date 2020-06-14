const { validationResult } = require('express-validator');

const forwardError = (err, next, statusCode = 500) => {
  if(typeof err === 'string') {
    err = new Error(err);
  }
  if (!err.statusCode) {
    err.statusCode = statusCode;
  }
  next(err);
};

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const forwardValidationErrors = (message, errors, next) => {
  const error = new Error(message);
  error.statusCode = 422;
  error.data = errors.array();
  next(error);
};

const validate = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    forwardValidationErrors(
      errors.array()[0].msg,
      errors,
      next
    );
  } else {
    forwardError(
      'Validation failed: Entered data is incorrect.',
      next,
      422
    );
  }
};

exports.forwardError = forwardError;
exports.throwError = throwError;
exports.validate = validate;
