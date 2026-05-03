const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/demo-data', authenticate, seedController.seedDemoData);

module.exports = router;
