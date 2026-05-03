const express = require('express');
const router = express.Router();

router.use('/api/auth', require('./auth.routes')); // New Auth & Security routes
router.use('/api/profile', require('./profile.routes')); // New Profile management
router.use('/api/smart', require('./smart.routes')); // New Smart Farming
router.use('/api/schemes', require('./scheme.routes')); // New Schemes & Subsidies
router.use('/api/apmc', require('./apmc.routes')); // New APMC Billing
router.use('/api/weather', require('./weather.routes')); // New Weather & Alerts
router.use('/api/chat', require('./chat.routes')); // New Chatbot Agent
router.use('/api/billing', require('./billing.routes')); // Billing & Loan History
router.use('/api/insurance-policy', require('./insurance.routes')); // Insurance Records
router.use('/api/notifications', require('./notification.routes')); // Alerts & Notifications
router.use('/api/experts', require('./expert.routes')); // Expert system
router.use('/api/seed', require('./seed.routes')); // Demo data seeding
router.use('/farmer', require('./farmer/farmer_route'));
router.use('/api/admin', require('./admin/admin_route'));
router.use('/scheme', require('./scheme/scheme_route'));
router.use('/district', require('./district/district_route'));
router.use('/area', require('./crop_existing/crop_existing_route'));
router.use('/cropdata', require('./crop_data/crop_data_route'));
router.use('/farm', require('./farm/farm_route'));
router.use('/expert', require('./expert/expert'));
router.use('/trader', require('./trader/trader_route'));
router.use('/APMC', require('./APMC/APMC_route'));


router.use('/training', require('./training/training_route'))

// Yield prediction (local ML-based)
const yieldPrediction = require('../controllers/yield_prediction');
router.get('/yield-predict', yieldPrediction.yieldPrediction);
router.get('/yield-metadata', yieldPrediction.yieldMetadata);

router.use('/insurance', require('./insurance_company/insurance_company'));

router.get('/', function (req, res) {
    return res.send('Hello');
});
module.exports = router;