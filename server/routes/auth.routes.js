const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// Public auth routes with rate limiting
router.post('/register', authLimiter, authController.register);
router.post('/send-otp', authLimiter, authController.sendOtp);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/login', authLimiter, authController.login);

// Token management
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
