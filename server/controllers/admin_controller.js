const admin_details = require("../models/admin_details");
const farmer_info = require("../models/farmer_info");
const User = require('../models/User.model');
const Profile = require('../models/Profile.model');
const Scheme = require('../models/Scheme.model');
const Application = require('../models/Application.model');
const category = ["SC", "ST", "OBC", "EWS", "GENERAL"];
const bill = require('../models/bill');

/**
 * Modern Dynamic Stats for Dashboard
 */
module.exports.getAdminStats = async (req, res) => {
    try {
        const farmerCount = await User.countDocuments({ role: 'farmer' });
        const schemeCount = await Scheme.countDocuments({ isActive: true });
        const appCount = await Application.countDocuments();
        const billCount = await bill.countDocuments();

        // Get district distribution for the chart
        const districtStats = await User.aggregate([
            { $match: { role: 'farmer' } },
            { $group: { _id: "$district", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return res.status(200).json({
            farmers: farmerCount,
            schemes: schemeCount,
            applications: appCount,
            bills: billCount,
            districtData: districtStats.map(d => ({ name: d._id || 'Unknown', farmers: d.count }))
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * List all Farmers with their profile info
 */
module.exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password -refreshToken').sort({ createdAt: -1 });
    // Join with profile
    const profiles = await Profile.find({ user: { $in: farmers.map(f => f._id) } });
    
    const combined = farmers.map(f => {
      const profile = profiles.find(p => p.user.toString() === f._id.toString());
      return { ...f.toObject(), profile };
    });

    return res.status(200).json(combined);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a Farmer
 */
module.exports.deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    await Profile.findOneAndDelete({ user: id });
    await Application.deleteMany({ user: id });
    return res.status(200).json({ message: "Farmer and all associated data deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//Admin login
module.exports.login = function (req, res) {
    if (req.body.Username && req.body.Password) {
        try {
            admin_details.findOne({ Username: req.body.Username }, function (err, user) {
                if (!user) {
                    return res.json({
                        status: "error",
                        error: "User is not found!!!"
                    });
                }
                else {
                    if (req.body.Password == user.Password) {
                        var userobg = user.toObject();
                        delete userobg.Password;
                        return res.status(200).json(userobg);
                    }
                    else {
                        return res.json({
                            error: "Password is incorrect!!!",
                            status: "error"
                        });
                    }
                }
            });
        } catch (error) {
            return res.json({
                status: "error",
                error: "Something went wrong please try after some time !!!"
            });
        }
    }
    else {
        return res.json({
            error: "Some problem in required Fields!!!",
            status: "error"
        });
    }
}

//API to find farmers from their ID
module.exports.findfarmerbyid = function (req, res) {
    try {

        farmer_info.findOne({ Farmerid: req.params.Farmerid }, function (err, farmer) {
            if (!farmer) {
                return res.json({
                    status: "error",
                    error: "Unable to find farmer !!!"
                });
            }
            else {
                var farmerObj = farmer.toObject();
                delete farmerObj.Password;
                return res.json(farmerObj);
            }
        })
    } catch (error) {
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time !!!"
        });
    }
};

//API to find farmers from their Mobilenumber
module.exports.findfarmerbymobilenum = function (req, res) {
    try {

        farmer_info.findOne({ Mobilenum: req.params.Mobilenum }, function (err, farmer) {
            if (!farmer) {
                return res.json({
                    status: "error",
                    error: "Unable to find farmer !!!"
                });
            }
            else {
                var farmerObj = farmer.toObject();
                delete farmerObj.Password;
                return res.json(farmerObj);
            }
        })
    } catch (error) {
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time !!!"
        });
    }
};

//More information about farmer

module.exports.farmerinformation = function (req, res) {
    try {

        farmer_info.findOne({ Farmerid: req.params.Farmerid }, function (err, farmerdata) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                })
            }
            else {
                return res.json(farmerdata);
            }
        })
    }
    catch (err) {
        console.log(err)
        return res.json({
            status: "error",
            error: "Something went wrong"
        })
    }
}



//API to find farmers from their adharnumber
module.exports.findfarmerbyadharnum = function (req, res) {
    try {

        farmer_info.findOne({ Adharnum: req.params.Adharnum }, function (err, farmer) {
            if (!farmer) {
                return res.json({
                    status: "error",
                    error: "Unable to find farmer !!!"
                });
            }
            else {
                var farmerObj = farmer.toObject();
                delete farmerObj.Password;
                return res.json(farmerObj);
            }
        })
    } catch (error) {
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time !!!"
        });
    }
};

//API to get details of all farmers
module.exports.findallfarmers = function (req, res) {
    try {

        farmer_info.find({}, "Farmerid Name Mobilenum", function (err, farmer) {
            if (!farmer) {
                return res.json({
                    status: "error",
                    error: "Unable to find farmer !!!"
                });
            }
            else {
                return res.json(farmer);
            }
        })
    } catch (error) {
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time !!!"
        });
    }
}

//API to find farmers by area and category
module.exports.findmanyfarmers = function (req, res) {
    try {
        if(req.params.District == "0" && req.params.Taluka == "0" && req.params.village == "0" && req.params.Category == "0" && req.params.Farmertype == "0")
        {
            farmer_info.find({}, "Farmerid Name", function (err, farmers) {
                /////////////////////////////////////////////////////here we need to send selected information  
                if (!farmers) {
                    return res.json({
                        status: "error",
                        error: "Unable to find farmer !!!"
                    });
                }
                else {
                    return res.json(farmers);
                }
            })
        }
        else if(req.params.Taluka == 0 && req.params.village == 0 && req.params.Category == 0 && req.params.Farmertype == 0)
        {
            farmer_info.find({District : req.params.District}, "Farmerid Name", function (err, farmers) {
                /////////////////////////////////////////////////////here we need to send selected information  
                if (!farmers) {
                    return res.json({
                        status: "error",
                        error: "Unable to find farmer !!!"
                    });
                }
                else {
                    return res.json(farmers);
                }
            })
        }
        else if((req.params.village == 0) && (req.params.Category == 0) && (req.params.Farmertype == 0))
        {
            // console.log("vk")
            farmer_info.find({District : req.params.District, Taluka : req.params.Taluka}, "Farmerid Name", function (err, farmers) {
                /////////////////////////////////////////////////////here we need to send selected information  
                if (!farmers) {
                    return res.json({
                        status: "error",
                        error: "Unable to find farmer !!!"
                    });
                }
                else {
                    return res.json(farmers);
                }
            })
        }
        else if(req.params.Category == 0 && req.params.Farmertype == 0)
        {
            farmer_info.find({District : req.params.District, Taluka : req.params.Taluka ,Village : req.params.Village}, "Farmerid Name", function (err, farmers) {
                /////////////////////////////////////////////////////here we need to send selected information  
                if (!farmers) {
                    return res.json({
                        status: "error",
                        error: "Unable to find farmer !!!"
                    });
                }
                else {
                    return res.json(farmers);
                }
            })
        }
        else if(req.params.Farmertype == 0)
        {
            farmer_info.find({District : req.params.District, Taluka : req.params.Taluka ,Village : req.params.Village, Category : req.params.Category}, "Farmerid Name", function (err, farmers) {
                /////////////////////////////////////////////////////here we need to send selected information  
                if (!farmers) {
                    return res.json({
                        status: "error",
                        error: "Unable to find farmer !!!"
                    });
                }
                else {
                    return res.json(farmers);
                }
            })
        }
        else{
            farmer_info.find({District : req.params.District, Taluka : req.params.Taluka ,Village : req.params.Village, Category : req.params.Category, Farmertype : req.params.Farmertype}, "Farmerid Name", function (err, farmers) {
                /////////////////////////////////////////////////////here we need to send selected information  
                if (!farmers) {
                    return res.json({
                        status: "error",
                        error: "Unable to find farmer !!!"
                    });
                }
                else {
                    return res.json(farmers);
                }
            })
        }
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time"
        })
    };
}


////////////////////////////////////////////////Regeistration details for admin home page///////////////////////////////////////////////
//Rejistered farmers details for admin home page  
module.exports.registeredfarmerdetails = async function (req, res) {
    try {
        let Totalregisteredfarmers = await farmer_info.count();
        let TotalSCfarmers = await farmer_info.count({ Category: "SC" });
        let TotalSTfarmers = await farmer_info.count({ Category: "ST" });
        let TotalOBCfarmers = await farmer_info.count({ Category: "OBC" });
        let TotalEWSfarmers = await farmer_info.count({ Category: "EWS" });
        let TotalGENERALfarmers = await farmer_info.count({ Category: "GENERAL" });

        return res.json({
            registeredfarmers: Totalregisteredfarmers,
            SCfarmers: TotalSCfarmers,
            STfarmers: TotalSTfarmers,
            OBCfarmers: TotalOBCfarmers,
            EWSfarmers: TotalEWSfarmers,
            GENERALfarmers: TotalGENERALfarmers,
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong please try again after some time",
            sattus: "error"
        })
    }
}

//Registered farmers details for admin home page district wise
module.exports.districtwise = async function (req, res) {
    try {
        let districts = await farmer_info.distinct("District")
        let data = []
        let highest = [

        ]
        for (let i = 0; i < districts.length; i++) {
            p = {

            }
            p['District'] = districts[i];

            for (let j = 0; j < 5; j++) {
                let info = await farmer_info.count({ District: districts[i], Category: category[j] });
                p[category[j]] = info;
                if(i==0)
                {
                    temp ={}
                    temp["Category"] = category[j]
                    temp["Registered_Farmers"] = info
                    temp["District"] = districts[i]
                    highest.push(temp)
                }
                else
                {
                    if(highest[j]["Registered_Farmers"] < info)
                    {
                        highest[j]["District"] = districts[i]
                        highest[j]["Registered_Farmers"] = info
                    }
                }
            }
            if(districts[i] == req.params.District){
                data.push(p);
            }
        }
        return res.json({data,highest});
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}

//Registered farmers details for admin home page talukawise
module.exports.talukawise = async function (req, res) {
    try {
        let taluka = await farmer_info.distinct("Taluka", { District: req.params.District });
        let data = []
        let highest = [

        ]
        for (let i = 0; i < taluka.length; i++) {
            p = {

            }
            p['Taluka'] = taluka[i];

            for (let j = 0; j < 5; j++) {
                let info = await farmer_info.count({ District: req.params.District, Taluka: taluka[i], Category: category[j] });
                p[category[j]] = info;
                if(i==0)
                {
                    temp ={}
                    temp["Category"] = category[j]
                    temp["Registered_Farmers"] = info
                    temp["Taluka"] = taluka[i]
                    highest.push(temp)
                }
                else
                {
                    if(highest[j]["Registered_Farmers"] < info)
                    {
                        highest[j]["Taluka"] = taluka[i]
                        highest[j]["Registered_Farmers"] = info
                    }
                }
            }
            if(taluka[i] ==req.params.Taluka)
            {
                data.push(p);
            }
        }
        return res.json({data,highest});
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}

//Registered farmers details for admin home page village wise
module.exports.villagewise = async function (req, res) {
    try {
        let village = await farmer_info.distinct("Village", { District: req.params.District , Taluka : req.params.Taluka });
        let data = []
        let highest = [

        ]
        for (let i = 0; i < village.length; i++) {
            p = {

            }
            p['Village'] = village[i];

            for (let j = 0; j < 5; j++) {
                let info = await farmer_info.count({ District: req.params.District, Taluka:req.params.Taluka , Village : village[i], Category: category[j] });
                p[category[j]] = info;

                if(i==0)
                {
                    temp ={}
                    temp["Category"] = category[j]
                    temp["Registered_Farmers"] = info
                    temp["Village"] = village[i]
                    highest.push(temp)
                }
                else
                {
                    if(highest[j]["Registered_Farmers"] < info)
                    {
                        highest[j]["Village"] = village[i]
                        highest[j]["Registered_Farmers"] = info
                    }
                }

            }

            if(village[i] == req.params.Village)
            {
                data.push(p);

            }
        }
        return res.json({data,highest});
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}

//analysis of farmers registration
module.exports.analysis = async function(req,res)
{
    if(req.params.Taluka == 0 && req.params.Village == 0)
    {
        try {
            let districts = await farmer_info.distinct("District")
            let data = []
            let highest = [
    
            ]
            for (let i = 0; i < districts.length; i++) {
                p = {
    
                }
                p['District'] = districts[i];
    
                for (let j = 0; j < 5; j++) {
                    let info = await farmer_info.count({ District: districts[i], Category: category[j] });
                    p[category[j]] = info;
                    if(i==0)
                    {
                        temp ={}
                        temp["Category"] = category[j]
                        temp["Registered_Farmers"] = info
                        temp["District"] = districts[i]
                        highest.push(temp)
                    }
                    else
                    {
                        if(highest[j]["Registered_Farmers"] < info)
                        {
                            highest[j]["District"] = districts[i]
                            highest[j]["Registered_Farmers"] = info
                        }
                    }
                }
                if(districts[i] == req.params.District){
                    data.push(p);
                }
            }
            return res.json({data,highest});
        }
        catch (err) {
            console.log(err);
            return res.json({
                error: "Something went wrong",
                status: "error"
            })
        }
    }
    else if(req.params.Village == 0)
    {
        try {
            let taluka = await farmer_info.distinct("Taluka", { District: req.params.District });
            let data = []
            let highest = [
    
            ]
            for (let i = 0; i < taluka.length; i++) {
                p = {
    
                }
                p['Taluka'] = taluka[i];
    
                for (let j = 0; j < 5; j++) {
                    let info = await farmer_info.count({ District: req.params.District, Taluka: taluka[i], Category: category[j] });
                    p[category[j]] = info;
                    if(i==0)
                    {
                        temp ={}
                        temp["Category"] = category[j]
                        temp["Registered_Farmers"] = info
                        temp["Taluka"] = taluka[i]
                        highest.push(temp)
                    }
                    else
                    {
                        if(highest[j]["Registered_Farmers"] < info)
                        {
                            highest[j]["Taluka"] = taluka[i]
                            highest[j]["Registered_Farmers"] = info
                        }
                    }
                }
                if(taluka[i] ==req.params.Taluka)
                {
                    data.push(p);
                }
            }
            return res.json({data,highest});
        }
        catch (err) {
            console.log(err);
            return res.json({
                error: "Something went wrong",
                status: "error"
            })
        }
    }
    else
    {
        try {
            let village = await farmer_info.distinct("Village", { District: req.params.District , Taluka : req.params.Taluka });
            let data = []
            let highest = [
    
            ]
            for (let i = 0; i < village.length; i++) {
                p = {
    
                }
                p['Village'] = village[i];
    
                for (let j = 0; j < 5; j++) {
                    let info = await farmer_info.count({ District: req.params.District, Taluka:req.params.Taluka , Village : village[i], Category: category[j] });
                    p[category[j]] = info;
    
                    if(i==0)
                    {
                        temp ={}
                        temp["Category"] = category[j]
                        temp["Registered_Farmers"] = info
                        temp["Village"] = village[i]
                        highest.push(temp)
                    }
                    else
                    {
                        if(highest[j]["Registered_Farmers"] < info)
                        {
                            highest[j]["Village"] = village[i]
                            highest[j]["Registered_Farmers"] = info
                        }
                    }
    
                }
    
                if(village[i] == req.params.Village)
                {
                    data.push(p);
    
                }
            }
            return res.json({data,highest});
        }
        catch (err) {
            console.log(err);
            return res.json({
                error: "Something went wrong",
                status: "error"
            })
        }

    }
}

module.exports.mapdata = async function(req,res)
{
    try{
        let data = [
            {
                "District": "Ahmedabad",
                "id": "IN.GU.AB",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Amreli",
                "id": "IN.GU.AM",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Anand",
                "id": "IN.GU.AN",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Aravalli",
                "id": "IN.GU.AR",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Banaskantha",
                "id": "IN.GU.BK",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Bharuch",
                "id": "IN.GU.BR",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Bhavnagar",
                "id": "IN.GU.BN",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Botad",
                "id": "IN.GU.BT",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Chhota Udepur",
                "id": "IN.GU.CU",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Dahod",
                "id": "IN.GU.DA",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Devbhoomi Dwarka",
                "id": "IN.GU.DD",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Gandhinagar",
                "id": "IN.GU.GA",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Gir Somnath",
                "id": "IN.GU.GS",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Jamnagar",
                "id": "IN.GU.JM",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Junagadh",
                "id": "IN.GU.JG",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Kachchh",
                "id": "IN.GU.KA",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Kheda",
                "id": "IN.GU.KD",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Mehsana",
                "id": "IN.GU.MA",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Mahisagar",
                "id": "IN.GU.MS",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Morbi",
                "id": "IN.GU.MB",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Narmada",
                "id": "IN.GU.NR",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Navsari",
                "id": "IN.GU.NV",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Panchmahal",
                "id": "IN.GU.PC",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Patan",
                "id": "IN.GU.PA",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Porbandar",
                "id": "IN.GU.PO",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Rajkot",
                "id": "IN.GU.RK",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Sabarkantha",
                "id": "IN.GU.SB",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Surat",
                "id": "IN.GU.SR",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Surendranagar",
                "id": "IN.GU.SD",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Tapi",
                "id": "IN.GU.TP",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Dangs (Ahwa)",
                "id": "IN.GU.DG",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Vadodara",
                "id": "IN.GU.VA",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            },
            {
                "District": "Valsad",
                "id": "IN.GU.VL",
                "value" : 0,
                "showlabel": 1,
                "link": "newchart-json-SAM"
            }
        ]
        if(req.params.Category != "All")
        {

            for(let i = 0;i< data.length ;i++)
            {
                count = await farmer_info.count({Category : req.params.Category , District : data[i].District});
                data[i].value = count;
            }
            return res.json(data)
        }
        else{
            for(let i = 0;i< data.length ;i++)
            {
                count = await farmer_info.count({District : data[i].District});
                data[i].value = count;
            }
            return res.json(data)
        }
    }
    catch(err)
    {
        console.log(err)
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}