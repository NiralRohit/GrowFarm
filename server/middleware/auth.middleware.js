const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const User = require('../models/User.model');

/**
 * Middleware to protect routes with JWT access tokens
 * Authorization: Bearer <token>
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, authConfig.JWT_ACCESS_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticateJWT;
