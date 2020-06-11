const jwt = require('jsonwebtoken');
const { throwError } = require('../controllers/utils');
const { TOKEN_SECRET } = require('../constants');

module.exports = (req, res, next) => {
  const token = req.get('Authorization').split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, TOKEN_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    throwError('Not Authenticated.', 401);
  }
  req.userId = decodedToken.userId;
  next();
}
