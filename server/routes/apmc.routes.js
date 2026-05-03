const express = require('express');
const router = express.Router();
const apmcController = require('../controllers/apmc.controller');
const authenticateJWT = require('../middleware/auth.middleware');
const requireRole = require('../middleware/rbac.middleware');

// Public/General
router.get('/trends', apmcController.getPriceTrends);

// Farmer Routes
router.get('/my-bills', authenticateJWT, requireRole(['farmer']), apmcController.getFarmerBills);

// Trader Routes
router.post('/bill/create', authenticateJWT, requireRole(['trader', 'admin']), apmcController.createBill);
router.get('/issued-bills', authenticateJWT, requireRole(['trader', 'admin']), apmcController.getTraderBills);

module.exports = router;
