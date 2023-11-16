// Sample authentication middleware
const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req, res, next) {
  const token = req.header('authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: Token missing' });
  }

  try {
    const decodedToken = jwt.verify(token.split(' ')[1], config.JWT_SECRET);
    req.userId = decodedToken.userId;

    // Continue with the request
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
}

module.exports = {
  authenticateToken,
};
