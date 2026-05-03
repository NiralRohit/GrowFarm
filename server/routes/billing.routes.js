const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/history', authenticate, billingController.getBills);
router.get('/summary', authenticate, billingController.getLoanSummary);

module.exports = router;
