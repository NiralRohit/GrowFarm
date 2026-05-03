const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/scheme.controller');
const authenticateJWT = require('../middleware/auth.middleware');
const requireRole = require('../middleware/rbac.middleware');

// Publicly view schemes
router.get('/all', schemeController.getAllSchemes);

// Profile-based eligibility and application
router.get('/eligible', authenticateJWT, schemeController.getEligibleSchemes);
router.post('/apply', authenticateJWT, schemeController.apply);
router.get('/my-applications', authenticateJWT, schemeController.getUserApplications);

// Admin: Management
router.patch('/status', authenticateJWT, requireRole(['admin', 'govt']), schemeController.updateStatus);
router.get('/applications/all', authenticateJWT, requireRole(['admin', 'govt']), schemeController.getAllApplications);

router.post('/create', authenticateJWT, requireRole(['admin', 'govt']), schemeController.createScheme);
router.put('/:id', authenticateJWT, requireRole(['admin', 'govt']), schemeController.updateScheme);
router.delete('/:id', authenticateJWT, requireRole(['admin', 'govt']), schemeController.deleteScheme);

module.exports = router;
