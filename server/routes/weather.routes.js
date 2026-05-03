const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const authenticateJWT = require('../middleware/auth.middleware');

// Weather data retrieval
router.get('/current', authenticateJWT, weatherController.getCurrentWeather);
router.get('/forecast', authenticateJWT, weatherController.getForecast);

module.exports = router;
