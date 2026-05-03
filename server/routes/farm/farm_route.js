const express = require('express');
const farm_controller = require('../../controllers/farm_controller');
const router = express.Router();

router.get('/allfarminfo',farm_controller.allfarminfo);

router.get('/farminfo/:Adharnum',farm_controller.farminfo);

router.get('/updatefarmertype/:Farmerid',farm_controller.updatefarmertype);
module.exports = router;