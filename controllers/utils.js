const forwardError = (err, next) => {
  if (err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}

const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

exports.forwardError = forwardError;
exports.throwError = throwError;
