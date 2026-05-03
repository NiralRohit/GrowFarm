const express = require('express');
const admin_controller = require('../../controllers/admin_controller');
const router = express.Router();

//Admin login
router.post('/login',admin_controller.login);

//find farmers by id
router.get('/findfarmerbyid/:Farmerid',admin_controller.findfarmerbyid);

//find farmers by mobile number
router.get('/findfarmerbymobilenum/:Mobilenum',admin_controller.findfarmerbymobilenum)

//find farmers by adhar number
router.get('/findfarmerbyadharnum/:Adharnum',admin_controller.findfarmerbyadharnum);

//list of all farmers
router.get('/findallfarmers',admin_controller.findallfarmers);

//API to find farmers by area and category
router.post('/findmanyfarmers/:District/:Taluka/:Village/:Category/:Farmertype',admin_controller.findmanyfarmers);

router.get('/farmerinformation/:Farmerid',admin_controller.farmerinformation);

//Home page 
//to get details of registered farmers
router.get('/registeredfarmerdetails',admin_controller.registeredfarmerdetails);


//To get district wise registered farmers 
router.get('/districtwise/:District',admin_controller.districtwise)

router.get('/talukawise/:District/:Taluka',admin_controller.talukawise)

router.get('/villagewise/:District/:Taluka/:Village',admin_controller.villagewise)

router.get('/mapdata/:Category',admin_controller.mapdata);

router.get('/analysis/:District/:Taluka/:Village',admin_controller.analysis);

// Dynamic Administration Routes (Modern System)
const authenticateJWT = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');

router.get('/stats', authenticateJWT, requireRole(['admin', 'govt']), admin_controller.getAdminStats);
router.get('/all-farmers', authenticateJWT, requireRole(['admin', 'govt']), admin_controller.getAllFarmers);
router.delete('/farmers/:id', authenticateJWT, requireRole(['admin', 'govt']), admin_controller.deleteFarmer);

module.exports = router;