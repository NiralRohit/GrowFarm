const express = require('express');
const farmer_controller = require("../../controllers/farmer_controller");
const router = express.Router();


////////////////////////////////////Farmer signup and login ////////////////////////////////////////////
router.post('/farmersignup',farmer_controller.farmer_signup);

router.post('/farmerlogin',farmer_controller.farmer_login);

router.post('/forgotpassword',farmer_controller.forgotpassword);


//To acess schemes for which farmer is eligible

router.get('/eligibleschemes/:Category/:Farmertype/:Farmerid',farmer_controller.eligibleschemes);

//Apply for a scheme 

router.post('/applyforscheme/:Schemeid/:Farmerid',farmer_controller.applyforscheme);

router.get('/temp',farmer_controller.temp);

router.post('/adhar',farmer_controller.adhar);

router.get('/applicationofschemes/:Farmerid',farmer_controller.applicationofscheme);


router.get("/mobilenumverify/:Mobilenum",farmer_controller.mobilenumverify);

router.get("/approvedschemes/:Farmerid",farmer_controller.approvedschemes);


router.get("/rejectedapplications/:Farmerid",farmer_controller.rejectedschemes);

router.get("/bills_farmers/:Farmerid",farmer_controller.bills_farmers)

router.get('/day_wise_price',farmer_controller.day_wise_price)
module.exports = router;