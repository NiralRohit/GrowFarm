const express = require('express');
const trader_controller = require('../../controllers/trader_controller');
const router = express.Router();

router.get('/get_trader_details/:GST_No',trader_controller.get_trader_details);

router.post('/trader_registration',trader_controller.trader_registration);

router.post('/trader_login',trader_controller.trader_login);

router.post('/create_bill',trader_controller.create_bill);

router.get('/listofbill_trader/:Bill_type/:GST_No',trader_controller.listofbill_trader);

module.exports = router;