//This is admin side scheme controller
const scheme_details = require('../models/scheme_details');
const farmer_info = require('../models/farmer_info');
const uniqueid = require('generate-unique-id');
const { count } = require('../models/admin_details');
var sid = process.env.TWILIO_SID || "your_twilio_sid_here";
var auth_token = process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token_here";
// var twilio = require("twilio")(sid, auth_token);
const client = require('twilio')(sid, auth_token);
// const scheme_details = require('../models/scheme_details');


//Add new schemes from Admin side
module.exports.add = function (req, res) {
    try {
        scheme_details.findOne({ "Title": req.body.Title }, function (err, scheme) {
            if (scheme) {
                return res.json({
                    error: "Scheme is already present !!!",
                    status: "error"
                });
            }
            else {
                var data = new scheme_details(req.body);
                let genretedid = uniqueid({
                    length: 8,
                    useLetters: false
                });
                data.Schemeid = genretedid;
                data.save().then(() => {
                    // console.log(data.Category);
                    farmer_info.find({ Category: data.Category, Farmertype: data.Farmertype, Fake: false }, function (err, farmer) {
                        // console.log(farmer.length);
                        for (let i = 0; i < farmer.length; i++) {
                            // console.log(farmer[i].Mobilenum);
                            client.messages
                                .create({
                                    body: data.Title + "\nDescription:\n" + data.Description + "\nHow to get benefits of the Scheme\n" + data.How + "\nFor more details click on the link:" + data.More + "\nExpired date:" + data.Expired,
                                    from: 'whatsapp:+14155238886',
                                    to: 'whatsapp:+91' + farmer[i].Mobilenum
                                })
                                .then(message => console.log(message.sid))
                                .catch(function (err) {
                                    if (err) {
                                        return res.json({
                                            error: "Something went wrong please try again after some time",
                                            status: "error"
                                        });
                                    }
                                })
                            // .done();
                        }
                        // console.log(count);
                        return res.json({
                            status: "ok",
                            result: "//Scheme added sucessfully//"
                        })
                    })
                });
            }

        });

    } catch (error) {
        return res.json({
            error: "Somthing went wrong please try again after some time",
            status: "error"
        });
    };

}

//API to delete schemes from admin side
module.exports.deletescheme = function (req, res) {
    try {

        scheme_details.findOne({ Schemeid: req.params.Schemeid }, function (err, scheme) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Unable to delete scheme !!!"
                });
            }
            else {
                scheme.Status = "Deleted";
                scheme.save();
                return res.json({
                    status: "ok",
                    result: "//Scheme has been deleted successfully//"
                });
            }
        });
    } catch (error) {
        return res.json({
            status: "error",
            error: "Something went wrong....lease try again after some time..."
        })
    }
}

//List of all active schemes 
module.exports.allactivescheme = function (req, res) {
    try {

        scheme_details.find({ Status: "Active", Expired: { '$gte': (new Date()) } }, 'Title Expired Applied Approved Reject Schemeid', function (err, scheme) {
            if (!scheme) {
                return res.json({
                    status: "error",
                    error: "Unable to find schemes"
                });
            }
            else {
                // const today = new Date().toLocaleDateString();
                // responce = []
                // for (let i = 0; i < scheme.length; i++) {
                //     if(scheme[i].Expired.toLocaleDateString() > today)
                //     {
                //         responce.push(scheme[i])
                //     }
                // }
                return res.json(scheme);
            }
        })
    } catch (error) {
        return res.json({
            status: "ok",
            error: "Spmething went wrong please try again after some time !!!"
        });
    }
}

//List of all Expired schemes 
module.exports.allexscheme = function (req, res) {
    try {

        scheme_details.find({ Status: "Active", Expired: { '$lt': (new Date()) } }, 'Title Expired Applied Approved Reject Schemeid', function (err, scheme) {
            if (!scheme) {
                return res.json({
                    status: "error",
                    error: "Unable to find schemes"
                });
            }
            else {
                return res.json(scheme);
            }
        })
    } catch (error) {
        return res.json({
            status: "ok",
            error: "Spmething went wrong please try again after some time !!!"
        });
    }
}

//List of all deleted schemes
module.exports.alldeletedschemes = function (req, res) {
    try {
        scheme_details.find({ Status: "Deleted" }, "Title Applied Approved Reject Schemeid", function (err, schemes) {
            if (err) {
                return res.json({
                    error: "Something went wrong please try agian after some time",
                    status: "error"
                })
            }
            else {
                return res.json(schemes);
            }
        });
    }
    catch (err) {
        return res.json({
            error: "Something went wrong please try agian after some time",
            status: "error"
        })
    }
}
//To get details information of schemes
//This is also use at farmer side to get more information about schemes
module.exports.schemeinfo = function (req, res) {
    scheme_details.findOne({ Schemeid: req.params.Schemeid }, function (err, scheme) {
        try {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Unable to find schemes"
                });
            }
            else {
                return res.json(scheme);
            }
        } catch (error) {
            return res.json({
                status: "ok",
                error: "Something went wrong please try again after some time !!!"
            });
        }
    });
}

////////////////////////////////////////APPLICATIONS/////////////////////////////////////////////////
//To get schemes for which applications are pendings
module.exports.appliedschemes = function (req, res) {
    try {
        scheme_details.find({
            Farmers: {
                $elemMatch: {
                    Status: "Applied"
                }
            }
        }, "Schemeid Title Expired Applied Approved Status", function (err, schemes) {
            if (err) {
                console.log(err);
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                });
            }
            else {
                return res.json(schemes);
            }
        });
    } catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        })
    }
}

//To show the pending application of perticular scheme
module.exports.applicationsofscheme = function (req, res) {
    try {
        scheme_details.findOne({ Schemeid: req.params.Schemeid }, "Farmers", function (err, application) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                if (application != null) {
                    let responce = []
                    for (let i = 0; i < application.Farmers.length; i++) {
                        if (application.Farmers[i].Status == "Applied") {
                            responce.push(application.Farmers[i])
                        }
                    }
                    return res.json(responce);
                }
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong please try again after some time",
            status: "error"
        });
    }
}


//////////////////////////////////////////APPROVED/////////////////////////////////////////////////


//API to approve the scheme
module.exports.approve = function (req, res) {
    try {
        scheme_details.findOne({
            Schemeid: req.params.Schemeid, Farmers: {
                $elemMatch: {
                    Farmerid: req.params.Farmerid
                }
            }
        }, "Farmers Approved", function (err, scheme) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                for (let i = 0; i < scheme.Farmers.length; i++) {
                    if (scheme.Farmers[i].Farmerid == req.params.Farmerid) {
                        scheme.Approved = scheme.Approved + 1;
                        scheme.Farmers[i].Status = "Approved";
                        scheme.Farmers[i].Reponcedate = new Date().toLocaleDateString();
                        scheme.save().then(() => {
                            return res.json({
                                status: "ok",
                                result: "Application has been approved"
                            });
                        });
                        break;
                        /////////////////////////////////////////////////////////////////////////////////////
                    }

                }
            }
        });
    } catch (err) {
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time"
        })
    }
};

//List of farmers whose application are approved for perticular scheme
module.exports.listofapprovedapplications = function (req, res) {
    try {
        scheme_details.findOne({ Schemeid: req.params.Schemeid }, "Farmers", function (err, application) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                if (application != null) {
                    let responce = []
                    for (let i = 0; i < application.Farmers.length; i++) {
                        if (application.Farmers[i].Status == "Approved") {
                            // delete application.Farmers[i];
                            responce.push(application.Farmers[i]);
                        }
                    }
                    return res.json(responce);
                }
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong please try again after some time",
            status: "error"
        });
    }
}


/////////////////////////////////////////REJECTED///////////////////////////////////////////////////

//API to reject the application of farmers
module.exports.reject = function (req, res) {
    try {
        scheme_details.findOne({
            Schemeid: req.params.Schemeid, Farmers:
            {
                $elemMatch: {
                    Farmerid: req.params.Farmerid
                }
            }
        }, function (err, scheme) {
            if (err) {
                return res.json({
                    error: "Something went wrong please try again after some time",
                    status: "error"
                });
            }
            else {
                // console.log(scheme);
                for (let i = 0; i < scheme.Farmers.length; i++) {
                    if (scheme.Farmers[i].Farmerid == req.params.Farmerid) {
                        scheme.Reject = scheme.Reject + 1;
                        scheme.Farmers[i].Status = "Reject";
                        scheme.Farmers[i].Reponcedate = new Date().toLocaleDateString();
                        scheme.save().then(() => {
                            return res.json({
                                status: "ok",
                                result: "Application has been rejected"
                            });
                        });
                        break;
                        /////////////////////////////////////////////////////////////////////////////////////
                    }

                }
            }
        });
    } catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong please try again after some time"
        })
    }

}

//List of rejected applications for perticular scheme
module.exports.listofrejectedapplications = function (req, res) {
    try {
        scheme_details.findOne({ Schemeid: req.params.Schemeid }, "Farmers", function (err, application) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                if (application != null) {
                    let responce = []
                    for (let i = 0; i < application.Farmers.length; i++) {
                        if (application.Farmers[i].Status == "Reject") {
                            // delete application.Farmers[i];
                            responce.push(application.Farmers[i])
                        }
                    }
                    return res.json(responce);
                }
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong please try again after some time",
            status: "error"
        });
    }
}



/////////////////////////////////////////Details analysis of perticular scheme/////////////////////////
//Total details
module.exports.farmerdetailsforscheme = function (req, res) {
    try {
        scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                })
            }
            else {
                let Totaleligible = await farmer_info.count({ Category: scheme.Category, Farmertype: scheme.Farmertype });

                let newdata = []
                let Total = {
                    Category: "Total",
                    Eligible_farmers: Totaleligible,
                    Applications: scheme.Applied,
                    Approved: scheme.Approved,
                    Reject: scheme.Reject,
                }
                newdata.push(Total);
                for (let i = 0; i < scheme.Category.length; i++) {
                    let temp = await farmer_info.count({ Category: scheme.Category[i], Farmertype: scheme.Farmertype });

                    let data = {
                        Category: scheme.Category[i]

                    }
                    data['Eligible_farmers'] = temp;

                    function cat(farmer) {
                        return farmer.Category == scheme.Category[i]
                    }
                    // function appl(farmer)
                    // {
                    //     return farmer.Status == "Applied"
                    // }
                    function appr(farmer) {
                        return farmer.Status == "Approved"
                    }
                    function rege(farmer) {
                        return farmer.Status == "Reject"
                    }
                    let t = scheme.Farmers.filter(cat)
                    // console.log(t.length);
                    // let applied = t.filter(appl)
                    let approved = t.filter(appr)
                    let reject = t.filter(rege)
                    // console.log(applied);
                    data["Applications"] = t.length;
                    data["Approved"] = approved.length;
                    data["Reject"] = reject.length;
                    newdata.push(data);
                }

                return res.json(newdata);
            }
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        })
    }
}

//list of district 
module.exports.listofdistrict = async function (req, res) {
    try {

        let district = await farmer_info.distinct("District");
        return res.json(district);
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}
//list of village
module.exports.listofvillage = async function (req, res) {
    try {

        let village = await farmer_info.distinct("Village", { District: req.params.District, Taluka: req.params.Taluka });
        return res.json(village);
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}
//list of taluka
module.exports.listoftaluka = async function (req, res) {
    try {

        let taluka = await farmer_info.distinct("Taluka", { District: req.params.District });
        return res.json(taluka);
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: "Something went wrong",
            status: "error"
        })
    }
}

//district wise analysis
// module.exports.districtwiseschemeanalysis = function (req, res) {

//     try {
//         scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
//             if (err) {
//                 console.log(err);
//                 return res.json({
//                     status: "error",
//                     error: "Something went wrong"
//                 })
//             }
//             else {
//                 let newdata = []
//                 let district = await farmer_info.distinct("District");
//                 //this for highest applications nd 
//                 let highestapplications = [
//                 ]
//                 let highesteligible = [
//                 ]

//                 console.log(district);

//                 for (let i = 0; i < district.length; i++) {

//                     function dist(farmer) {
//                         return farmer.District == district[i];
//                     }
//                     let workon = scheme.Farmers.filter(dist);
//                     for (let j = 0; j < scheme.Category.length; j++) {
//                         //Eligible
//                         let temp = await farmer_info.count({ District: district[i], Category: scheme.Category[j], Farmertype: scheme.Farmertype });
//                         let data = {
//                             Category: scheme.Category[j]
//                         }

//                         data["District"] = district[i];
//                         data['Eligible_farmers'] = temp;

//                         //here we start applied, approve and reject
//                         function cat(farmer) {
//                             return farmer.Category == scheme.Category[j]
//                         }

//                         function appr(farmer) {
//                             return farmer.Status == "Approved"
//                         }
//                         function rege(farmer) {
//                             return farmer.Status == "Reject"
//                         }
//                         let t = workon.filter(cat)
//                         // console.log(t.length);
//                         // let applied = t.filter(appl)
//                         let approved = t.filter(appr)
//                         let reject = t.filter(rege)
//                         // console.log(applied);
//                         data["Applications"] = t.length;
//                         data["Approved"] = approved.length;
//                         data["Reject"] = reject.length;

//                         if (i == 0) {
//                             highestpushelig = {

//                             }
//                             highestpushapp = {

//                             }
//                             //For highest applications
//                             highestpushapp["Category"] = scheme.Category[j]
//                             highestpushapp["District"] = district[i]
//                             highestpushapp["Applications"] = t.length

//                             //For highest eligible
//                             highestpushelig["Category"] = scheme.Category[j]
//                             highestpushelig["District"] = district[i]
//                             highestpushelig["Eligible"] = temp

//                             highesteligible.push(highestpushelig);
//                             highestapplications.push(highestpushapp);

//                         }
//                         else {
//                             if (highestapplications[j]["Applications"] < t.length) {
//                                 highestapplications[j]["Applications"] = t.length
//                                 highestapplications[j]["District"] = district[i]

//                             }
//                             if (highesteligible[j]["Eligible"] < temp) {
//                                 highesteligible[j]["Eligible"] = temp
//                                 highesteligible[j]["District"] = district[i]
//                             }
//                         }

//                         // d.push(data);
//                         if (district[i] == req.params.District) {
//                             newdata.push(data);
//                         }
//                     }
//                 }
//                 return res.json({ newdata, highestapplications, highesteligible });

//             }
//         });
//     }
//     catch (err) {
//         console.log(err);
//         return res.json({
//             status: "error",
//             error: "Something went wrong"
//         })
//     }
// }

//Taluka wise analysis
// module.exports.talukawiseschemeanalysis = function (req, res) {
//     try {
//         scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
//             if (err) {
//                 console.log(err);
//                 return res.json({
//                     status: "error",
//                     error: "Something went wrong"
//                 })
//             }
//             else {
//                 let newdata = []
//                 let taluka = await farmer_info.distinct("Taluka", { District: req.params.District });
//                 // let district = await farmer_info.distinct("District");
//                 console.log(taluka);

//                 let highestapplications = [
//                 ]
//                 let highesteligible = [
//                 ]

//                 for (let i = 0; i < taluka.length; i++) {
//                     function distrtal(farmer) {
//                         return ((farmer.District == req.params.District) && (farmer.Taluka == taluka[i]));
//                     }
//                     // let districtfilter = scheme.Farmers.filter(dist);
//                     //here it is taluka filter
//                     let workon = scheme.Farmers.filter(distrtal);
//                     for (let j = 0; j < scheme.Category.length; j++) {
//                         //Eligible
//                         let temp = await farmer_info.count({ District: req.params.District, Category: scheme.Category[j], Farmertype: scheme.Farmertype, Taluka: taluka[i] });
//                         let data = {
//                             Category: scheme.Category[j]

//                         }
//                         data["Taluka"] = taluka[i];
//                         data['Eligible_farmers'] = temp;

//                         //here we start applied, approve and reject
//                         function cat(farmer) {
//                             return farmer.Category == scheme.Category[j]
//                         }

//                         function appr(farmer) {
//                             return farmer.Status == "Approved"
//                         }
//                         function rege(farmer) {
//                             return farmer.Status == "Reject"
//                         }
//                         let t = workon.filter(cat)
//                         // console.log(t.length);
//                         // let applied = t.filter(appl)
//                         let approved = t.filter(appr)
//                         let reject = t.filter(rege)
//                         // console.log(applied);
//                         data["Applications"] = t.length;
//                         data["Approved"] = approved.length;
//                         data["Reject"] = reject.length;

//                         if (i == 0) {
//                             highestpushelig = {

//                             }
//                             highestpushapp = {

//                             }
//                             //For highest applications
//                             highestpushapp["Category"] = scheme.Category[j]
//                             highestpushapp["Taluka"] = taluka[i]
//                             highestpushapp["Applications"] = t.length

//                             //For highest eligible
//                             highestpushelig["Category"] = scheme.Category[j]
//                             highestpushelig["Taluka"] = taluka[i]
//                             highestpushelig["Eligible"] = temp

//                             highesteligible.push(highestpushelig);
//                             highestapplications.push(highestpushapp);

//                         }
//                         else {
//                             if (highestapplications[j]["Applications"] < t.length) {
//                                 highestapplications[j]["Applications"] = t.length
//                                 highestapplications[j]["Taluka"] = taluka[i]

//                             }
//                             if (highesteligible[j]["Eligible"] < temp) {
//                                 highesteligible[j]["Eligible"] = temp
//                                 highesteligible[j]["Taluka"] = taluka[i]
//                             }
//                         }


//                         // d.push(data);
//                         if (taluka[i] == req.params.Taluka) {
//                             newdata.push(data);
//                         }
//                     }

//                 }
//                 return res.json({ newdata, highestapplications, highesteligible })
//             }
//         })


//     }
//     catch (err) {
//         console.log(err);
//         return res.json({
//             status: "error",
//             error: "Something went wrong"
//         })
//     }
// }

//Village wise analysis
// module.exports.villagewiseschemeanalysis = function (req, res) {
//     try {
//         scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
//             if (err) {
//                 console.log(err);
//                 return res.json({
//                     status: "error",
//                     error: "Something went wrong"
//                 })
//             }
//             else {
//                 let newdata = []

//                 let highestapplications = [
//                 ]
//                 let highesteligible = [
//                 ]

//                 let village = await farmer_info.distinct("Village", { District: req.params.District, Taluka: req.params.Taluka });
//                 console.log(village);

//                 for (let i = 0; i < village.length; i++) {
//                     function distrtalvill(farmer) {
//                         return ((farmer.District == req.params.District) && (farmer.Taluka == req.params.Taluka) && (farmer.village == village[i]));
//                     }
//                     let workon = scheme.Farmers.filter(distrtalvill)
//                     for (let j = 0; j < scheme.Category.length; j++) {
//                         //Eligible
//                         let temp = await farmer_info.count({ District: req.params.District, Category: scheme.Category[j], Farmertype: scheme.Farmertype, Taluka: req.params.Taluka, Village: village[i] });
//                         let data = {
//                             Category: scheme.Category[j]

//                         }
//                         data["Village"] = village[i];
//                         data['Eligible_farmers'] = temp;

//                         //here we start applied, approve and reject
//                         function cat(farmer) {
//                             return farmer.Category == scheme.Category[j]
//                         }

//                         function appr(farmer) {
//                             return farmer.Status == "Approved"
//                         }
//                         function rege(farmer) {
//                             return farmer.Status == "Reject"
//                         }
//                         let t = workon.filter(cat)
//                         // console.log(t.length);
//                         // let applied = t.filter(appl)
//                         let approved = t.filter(appr)
//                         let reject = t.filter(rege)
//                         // console.log(applied);
//                         data["Applications"] = t.length;
//                         data["Approved"] = approved.length;
//                         data["Reject"] = reject.length;

//                         if (i == 0) {
//                             highestpushelig = {

//                             }
//                             highestpushapp = {

//                             }
//                             //For highest applications
//                             highestpushapp["Category"] = scheme.Category[j]
//                             highestpushapp["Village"] = village[i]
//                             highestpushapp["Applications"] = t.length

//                             //For highest eligible
//                             highestpushelig["Category"] = scheme.Category[j]
//                             highestpushelig["Village"] = village[i]
//                             highestpushelig["Eligible"] = temp

//                             highesteligible.push(highestpushelig);
//                             highestapplications.push(highestpushapp);

//                         }
//                         else {
//                             if (highestapplications[j]["Applications"] < t.length) {
//                                 highestapplications[j]["Applications"] = t.length
//                                 highestapplications[j]["Village"] = village[i]

//                             }
//                             if (highesteligible[j]["Eligible"] < temp) {
//                                 highesteligible[j]["Eligible"] = temp
//                                 highesteligible[j]["Village"] = village[i]
//                             }
//                         }

//                         if (village[i] == req.params.Village) {
//                             newdata.push(data);
//                         }
//                     }
//                 }
//                 return res.json({ newdata, highestapplications, highesteligible });
//             }
//         })


//     }
//     catch (err) {
//         console.log(err);
//         return res.json({
//             status: "error",
//             error: "Something went wrong"
//         })
//     }
// }

//Map data for perticular scheme

module.exports.mapdata = function (req, res) {
    try {
       
        scheme_details.findOne({ Schemeid: req.params.Schemeid }, function (err, scheme) {
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
            if (err) {
                console.log(err)
                return res.json({
                    error: "Something went wrong",
                    status: "error"
                });
            }
            else{

                if(req.params.Category != "All")
                {

                    for(let i =0; i <data.length;i++)
                    {
                        function filterof(farmer)
                        {
                            return ((farmer.Category == req.params.Category) &&(data[i].District == farmer.District))
                        }   
                        let count = (scheme.Farmers.filter(filterof)).length;

                        data[i].value = count;
                
                    }
                    return res.json(data);
                }
                else{
                    for(let i =0; i <data.length;i++)
                    {
                        function filterof(farmer)
                        {
                            return (data[i].District == farmer.District)
                        }   
                        let count = (scheme.Farmers.filter(filterof)).length;
                        data[i].value = count;
                
                    }
                    return res.json(data);
                }

            }
        })
    }
    catch (err) {
        console.log(err)
        return res.json({
            error: "Something went wrong",
            status: "error"
        });
    }
}


//analysis of perticular scheme
module.exports.analysis = function(req,res)
{
    if(req.params.Taluka == 0 && req.params.Village == 0)
    {
        try {
            scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    })
                }
                else {
                    let newdata = []
                    let district = await farmer_info.distinct("District");
                    //this for highest applications nd 
                    let highestapplications = [
                    ]
                    let highesteligible = [
                    ]
    
                    console.log(district);
    
                    for (let i = 0; i < district.length; i++) {
    
                        function dist(farmer) {
                            return farmer.District == district[i];
                        }
                        let workon = scheme.Farmers.filter(dist);
                        for (let j = 0; j < scheme.Category.length; j++) {
                            //Eligible
                            let temp = await farmer_info.count({ District: district[i], Category: scheme.Category[j], Farmertype: scheme.Farmertype });
                            let data = {
                                Category: scheme.Category[j]
                            }
    
                            data["District"] = district[i];
                            data['Eligible_farmers'] = temp;
    
                            //here we start applied, approve and reject
                            function cat(farmer) {
                                return farmer.Category == scheme.Category[j]
                            }
    
                            function appr(farmer) {
                                return farmer.Status == "Approved"
                            }
                            function rege(farmer) {
                                return farmer.Status == "Reject"
                            }
                            let t = workon.filter(cat)
                            // console.log(t.length);
                            // let applied = t.filter(appl)
                            let approved = t.filter(appr)
                            let reject = t.filter(rege)
                            // console.log(applied);
                            data["Applications"] = t.length;
                            data["Approved"] = approved.length;
                            data["Reject"] = reject.length;
    
                            if (i == 0) {
                                highestpushelig = {
    
                                }
                                highestpushapp = {
    
                                }
                                //For highest applications
                                highestpushapp["Category"] = scheme.Category[j]
                                highestpushapp["District"] = district[i]
                                highestpushapp["Applications"] = t.length
    
                                //For highest eligible
                                highestpushelig["Category"] = scheme.Category[j]
                                highestpushelig["District"] = district[i]
                                highestpushelig["Eligible"] = temp
    
                                highesteligible.push(highestpushelig);
                                highestapplications.push(highestpushapp);
    
                            }
                            else {
                                if (highestapplications[j]["Applications"] < t.length) {
                                    highestapplications[j]["Applications"] = t.length
                                    highestapplications[j]["District"] = district[i]
    
                                }
                                if (highesteligible[j]["Eligible"] < temp) {
                                    highesteligible[j]["Eligible"] = temp
                                    highesteligible[j]["District"] = district[i]
                                }
                            }
    
                            // d.push(data);
                            if (district[i] == req.params.District) {
                                newdata.push(data);
                            }
                        }
                    }
                    return res.json({ newdata, highestapplications, highesteligible });
    
                }
            });
        }
        catch (err) {
            console.log(err);
            return res.json({
                status: "error",
                error: "Something went wrong"
            })
        }
    }
    else if(req.params.Village == 0)
    {
        try {
            scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    })
                }
                else {
                    let newdata = []
                    let taluka = await farmer_info.distinct("Taluka", { District: req.params.District });
                    // let district = await farmer_info.distinct("District");
                    console.log(taluka);
    
                    let highestapplications = [
                    ]
                    let highesteligible = [
                    ]
    
                    for (let i = 0; i < taluka.length; i++) {
                        function distrtal(farmer) {
                            return ((farmer.District == req.params.District) && (farmer.Taluka == taluka[i]));
                        }
                        // let districtfilter = scheme.Farmers.filter(dist);
                        //here it is taluka filter
                        let workon = scheme.Farmers.filter(distrtal);
                        for (let j = 0; j < scheme.Category.length; j++) {
                            //Eligible
                            let temp = await farmer_info.count({ District: req.params.District, Category: scheme.Category[j], Farmertype: scheme.Farmertype, Taluka: taluka[i] });
                            let data = {
                                Category: scheme.Category[j]
    
                            }
                            data["Taluka"] = taluka[i];
                            data['Eligible_farmers'] = temp;
    
                            //here we start applied, approve and reject
                            function cat(farmer) {
                                return farmer.Category == scheme.Category[j]
                            }
    
                            function appr(farmer) {
                                return farmer.Status == "Approved"
                            }
                            function rege(farmer) {
                                return farmer.Status == "Reject"
                            }
                            let t = workon.filter(cat)
                            // console.log(t.length);
                            // let applied = t.filter(appl)
                            let approved = t.filter(appr)
                            let reject = t.filter(rege)
                            // console.log(applied);
                            data["Applications"] = t.length;
                            data["Approved"] = approved.length;
                            data["Reject"] = reject.length;
    
                            if (i == 0) {
                                highestpushelig = {
    
                                }
                                highestpushapp = {
    
                                }
                                //For highest applications
                                highestpushapp["Category"] = scheme.Category[j]
                                highestpushapp["Taluka"] = taluka[i]
                                highestpushapp["Applications"] = t.length
    
                                //For highest eligible
                                highestpushelig["Category"] = scheme.Category[j]
                                highestpushelig["Taluka"] = taluka[i]
                                highestpushelig["Eligible"] = temp
    
                                highesteligible.push(highestpushelig);
                                highestapplications.push(highestpushapp);
    
                            }
                            else {
                                if (highestapplications[j]["Applications"] < t.length) {
                                    highestapplications[j]["Applications"] = t.length
                                    highestapplications[j]["Taluka"] = taluka[i]
    
                                }
                                if (highesteligible[j]["Eligible"] < temp) {
                                    highesteligible[j]["Eligible"] = temp
                                    highesteligible[j]["Taluka"] = taluka[i]
                                }
                            }
    
    
                            // d.push(data);
                            if (taluka[i] == req.params.Taluka) {
                                newdata.push(data);
                            }
                        }
    
                    }
                    return res.json({ newdata, highestapplications, highesteligible })
                }
            })
    
    
        }
        catch (err) {
            console.log(err);
            return res.json({
                status: "error",
                error: "Something went wrong"
            })
        }
    }
    else
    {
        try {
            scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, scheme) {
                if (err) {
                    console.log(err);
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    })
                }
                else {
                    let newdata = []
    
                    let highestapplications = [
                    ]
                    let highesteligible = [
                    ]
    
                    let village = await farmer_info.distinct("Village", { District: req.params.District, Taluka: req.params.Taluka });
                    console.log(village);
    
                    for (let i = 0; i < village.length; i++) {
                        function distrtalvill(farmer) {
                            return ((farmer.District == req.params.District) && (farmer.Taluka == req.params.Taluka) && (farmer.village == village[i]));
                        }
                        let workon = scheme.Farmers.filter(distrtalvill)
                        for (let j = 0; j < scheme.Category.length; j++) {
                            //Eligible
                            let temp = await farmer_info.count({ District: req.params.District, Category: scheme.Category[j], Farmertype: scheme.Farmertype, Taluka: req.params.Taluka, Village: village[i] });
                            let data = {
                                Category: scheme.Category[j]
    
                            }
                            data["Village"] = village[i];
                            data['Eligible_farmers'] = temp;
    
                            //here we start applied, approve and reject
                            function cat(farmer) {
                                return farmer.Category == scheme.Category[j]
                            }
    
                            function appr(farmer) {
                                return farmer.Status == "Approved"
                            }
                            function rege(farmer) {
                                return farmer.Status == "Reject"
                            }
                            let t = workon.filter(cat)
                            // console.log(t.length);
                            // let applied = t.filter(appl)
                            let approved = t.filter(appr)
                            let reject = t.filter(rege)
                            // console.log(applied);
                            data["Applications"] = t.length;
                            data["Approved"] = approved.length;
                            data["Reject"] = reject.length;
    
                            if (i == 0) {
                                highestpushelig = {
    
                                }
                                highestpushapp = {
    
                                }
                                //For highest applications
                                highestpushapp["Category"] = scheme.Category[j]
                                highestpushapp["Village"] = village[i]
                                highestpushapp["Applications"] = t.length
    
                                //For highest eligible
                                highestpushelig["Category"] = scheme.Category[j]
                                highestpushelig["Village"] = village[i]
                                highestpushelig["Eligible"] = temp
    
                                highesteligible.push(highestpushelig);
                                highestapplications.push(highestpushapp);
    
                            }
                            else {
                                if (highestapplications[j]["Applications"] < t.length) {
                                    highestapplications[j]["Applications"] = t.length
                                    highestapplications[j]["Village"] = village[i]
    
                                }
                                if (highesteligible[j]["Eligible"] < temp) {
                                    highesteligible[j]["Eligible"] = temp
                                    highesteligible[j]["Village"] = village[i]
                                }
                            }
    
                            if (village[i] == req.params.Village) {
                                newdata.push(data);
                            }
                        }
                    }
                    return res.json({ newdata, highestapplications, highesteligible });
                }
            })
    
    
        }
        catch (err) {
            console.log(err);
            return res.json({
                status: "error",
                error: "Something went wrong"
            })
        }
    }
}