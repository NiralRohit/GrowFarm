const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const authenticateJWT = require('../middleware/auth.middleware');

// All profile routes are protected by authentication
router.use(authenticateJWT);

// GET/PUT profile
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Handle document uploads (Multer middleware used inside controller or here)
router.post('/upload', profileController.uploadMiddleware, profileController.uploadDocuments);
router.post('/verify-aadhaar', profileController.verifyAadhaar);

module.exports = router;
