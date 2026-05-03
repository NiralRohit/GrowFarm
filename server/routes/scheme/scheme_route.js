const express = require('express');
const scheme_controller = require('../../controllers/scheme_controller');
const router = express.Router();

router.post('/add',scheme_controller.add);

////////////////////////////All schemes admin side///////////////////////////////////

//All active schemes
router.get('/allactivescheme',scheme_controller.allactivescheme);
//All expired schemes
router.get('/allexscheme',scheme_controller.allexscheme);
//All deleted schemes
router.get('/alldeletedschemes',scheme_controller.alldeletedschemes);

router.get('/schemeinfo/:Schemeid',scheme_controller.schemeinfo);

router.delete('/deletescheme/:Schemeid',scheme_controller.deletescheme);


router.get('/appliedschemes',scheme_controller.appliedschemes);

router.get('/applicationsofscheme/:Schemeid',scheme_controller.applicationsofscheme);




router.post('/approve/:Schemeid/:Farmerid',scheme_controller.approve);

// router.get('/listofapprove',scheme_controller.listofapproved);

router.get('/listofapprovedapplications/:Schemeid',scheme_controller.listofapprovedapplications);




// router.get("/eligiblefarmers/:Schemeid",scheme_controller.eligiblefarmers);



router.get("/reject/:Schemeid/:Farmerid",scheme_controller.reject);

//List of schems for which admin reject the applications
// router.get("/rejectedapplications",scheme_controller.rejectedapplications);

router.get("/listofrejectedapplications/:Schemeid",scheme_controller.listofrejectedapplications);



///////////////////////////////////////Detail analyses of scheme////////////////////////////////////
router.get('/farmerdetailsforscheme/:Schemeid',scheme_controller.farmerdetailsforscheme);

router.get('/list',scheme_controller.listofdistrict);
router.get('/list/:District',scheme_controller.listoftaluka);
router.get('/list/:District/:Taluka',scheme_controller.listofvillage);

// router.get('/districtwiseschemeanalysis/:Schemeid/:District',scheme_controller.districtwiseschemeanalysis);

// router.get('/talukawiseschemeanalysis/:Schemeid/:District/:Taluka',scheme_controller.talukawiseschemeanalysis);

// router.get('/villagewiseschemeanalysis/:Schemeid/:District/:Taluka/:Village',scheme_controller.villagewiseschemeanalysis);

router.get('/analysis/:Schemeid/:District/:Taluka/:Village',scheme_controller.analysis);

router.get('/mapdata/:Schemeid/:Category',scheme_controller.mapdata);

module.exports = router;