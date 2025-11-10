const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    // Get token from the request header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches user data to the request object
    next(); // continue to the actual route
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;