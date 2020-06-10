const forwardError = (err, next) => {
  if (err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}

exports.forwardError = forwardError;
