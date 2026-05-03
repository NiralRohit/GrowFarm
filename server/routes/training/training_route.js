const express = require('express');
const trainig_controller = require('../../controllers/training_program_controller');
const router = express.Router();

router.post('/add_training_program',trainig_controller.add_new_training);

router.get('/list_of_training_Active',trainig_controller.list_of_training_Active);

router.get('/apply_for_training/:Trainingid/:Farmerid',trainig_controller.apply_for_training);

router.get('/list_of_applications_admin/:Trainingid',trainig_controller.list_of_applications_admin);

router.get('/list_of_training_farmer/:Farmerid',trainig_controller.list_of_training_farmer);

router.get('/delete_training/:Trainingid',trainig_controller.delete_training);

router.get('/list_of_expired',trainig_controller.list_of_expired);

router.get('/list_of_deleted',trainig_controller.list_of_deleted);

router.get('/list_of_training_deleted',trainig_controller.list_of_training_deleted);


module.exports = router;