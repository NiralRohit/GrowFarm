const express = require('express');
const crop_data_controller = require('../../controllers/crop_data_controller');
const router = express.Router();


router.post("/crophistoryform",crop_data_controller.crop_history_form);

router.get("/crophistory/:UPIN",crop_data_controller.crop_history);
module.exports = router;