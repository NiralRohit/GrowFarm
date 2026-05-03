const express = require('express');
const APMC_controller = require('../../controllers/APMC_controller');
const router = express.Router();

//APMC login
router.post('/APMC_login',APMC_controller.login);

router.get('/getall_traders',APMC_controller.getall_traders);

router.get('/bills_of_trader/:GST_No/:Bill_type',APMC_controller.bills_of_trader);

// router.get('/dates',APMC_controller.dates);

router.get('/day_wise_APMC',APMC_controller.day_wise_APMC);
module.exports = router;