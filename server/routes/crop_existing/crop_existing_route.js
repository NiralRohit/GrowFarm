const express = require('express');
const crop_existing_controller = require('../../controllers/crop_existing_controller');
const router = express.Router();

//Cultivated and non cultivated area district wise
router.get('/cultivatedarea/:District',crop_existing_controller.cultivatedareafun);

//District wise available Irigation sources 
router.get('/irigation/:District',crop_existing_controller.irigationfun);

//Area production and yield
router.get('/apy/:District/:Crop',crop_existing_controller.apy)

router.get('/district_soil/:District',crop_existing_controller.district_soil);

module.exports = router;