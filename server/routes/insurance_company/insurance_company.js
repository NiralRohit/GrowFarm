const express = require('express');
const insurance_controller = require('../../controllers/insurance_company_controller');
const router = express.Router();

router.post("/insurance_company_login",insurance_controller.insurance_company_login);

module.exports = router;