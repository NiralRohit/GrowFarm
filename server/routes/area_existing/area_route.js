const express = require('express');
const area_controller = require('../../controllers/crop_existing_controller');
const router = express.Router();

//Cultivated and non cultivated area district wise
router.get('/cultivatedarea/:District',area_controller.cultivatedareafun);

//District wise available Irigation sources 
router.get('/irigation/:District',area_controller.irigationfun);

//Area production and yield
router.get('/apy/:District/:Crop',area_controller.apy)

module.exports = router;