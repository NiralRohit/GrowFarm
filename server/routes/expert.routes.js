const express = require('express');
const router = express.Router();
const expertController = require('../controllers/expert.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/rbac.middleware');

// Public - any logged-in user can see experts list
router.get('/list', authenticate, expertController.getAllExperts);

// Expert only
router.get('/dashboard', authenticate, requireRole(['expert']), expertController.getExpertDashboard);
router.get('/district-farmers', authenticate, requireRole(['expert']), expertController.getDistrictFarmers);

module.exports = router;
