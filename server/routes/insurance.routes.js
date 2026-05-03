const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insurance.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/policies', authenticate, insuranceController.getPolicies);
router.get('/summary', authenticate, insuranceController.getSummary);
router.post('/apply', authenticate, insuranceController.applyInsurance);

module.exports = router;
