const express = require('express');
const router = express.Router();
const smartController = require('../controllers/smart.controller');
const multer = require('multer');

// Configure Multer for disease detection photo uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(file.mimetype)) cb(null, true);
        else cb(new Error('Invalid image type.'));
    }
});

// Routes
router.post('/crop-recommend', smartController.recommendCrop);
router.post('/disease-detect', upload.single('file'), smartController.detectDisease);

module.exports = router;
