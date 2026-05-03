const express = require('express');
const expert_controller = require('../../controllers/expert_controller');
const router = express.Router();

router.post('/registration',expert_controller.registration)

router.post('/expert_login',expert_controller.expertlogin);

router.get('/list_of_experts',expert_controller.list_of_experts);
module.exports = router;