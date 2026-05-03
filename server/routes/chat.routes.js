const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authenticateJWT = require('../middleware/auth.middleware');

// Chat interaction
router.post('/message', authenticateJWT, chatController.handleMessage);

// Chat history
router.get('/history', authenticateJWT, chatController.getHistory);
router.delete('/history', authenticateJWT, chatController.clearHistory);
router.get('/sessions', authenticateJWT, chatController.getSessions);

module.exports = router;
