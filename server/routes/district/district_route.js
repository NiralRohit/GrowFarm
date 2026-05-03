const express = require('express');
const district_controller = require('../../controllers/district_controller')
const router = express.Router();

router.get('/:District',district_controller.taluka);
router.get('/:District/:Taluka',district_controller.village);

module.exports = router;