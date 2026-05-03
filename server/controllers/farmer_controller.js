const farmer_info = require("../models/farmer_info");
const adhar_details = require("../models/adhar_details");
const farm = require('../models/farm');
const scheme_details = require('../models/scheme_details');
// const scheme_details = require('../models/scheme_details');
// const bcrypt = require("bcrypt");
const uniqueid = require('generate-unique-id');
var sid = process.env.TWILIO_SID || "your_twilio_sid_here";
var auth_token = process.env.TWILIO_AUTH_TOKEN || "your_twilio_auth_token_here";
var twilio = require("twilio")(sid, auth_token);
const otpGenerator = require('otp-generator');
const e = require("express");
const bill = require('../models/bill');

//------Sign-up & Log-in system of farmers-----//

//Farner Sign-up
module.exports.farmer_signup = async function (req, res) {

    // const salt = await bcrypt.genSalt(10);
    // req.body.Createpass = await bcrypt.hash(req.body.Createpass, salt);
    // req.body.Confirmpass = await bcrypt.hash(req.body.Confirmpass, salt);
    // req.body.Password = await bcrypt.hash(req.body.Password, salt);
    // console.log(req.body);
    try {
        var olduser = await farmer_info.findOne({ Mobilenum: req.body.Mobilenum });
        if (olduser) {
            return res.json({
                error: "User Already Exists",
                status: "error"
            })
        }
        else {
            var data = new farmer_info(req.body);
            const genretedid = uniqueid({
                length: 12,
                useLetters: false
            });

            data.Farmerid = genretedid;
            // data.Farmertype = "Marginal";
            let typeoffarmer = "Marginal"
            farm.find({
                Ownership_Details: {
                    $elemMatch: {
                        Adharnum: data.Adharnum
                    }
                }
            }, async function (err, farmdata) {
                // console.log(data.Adharnum);
                if (err) {
                    console.log("Error");
                    return res.json({
                        status: "error",
                        error: "Something went wrong"
                    })
                }
                else {
                    // console.log(farmdata)
                    let soil = 0;
                    for (let i = 0; i < farmdata.length; i++) {
                        soil = soil + farmdata[i].Hectare;
                    }

                    if (soil < 1) {
                        typeoffarmer = "Marginal"
                    }
                    else if (soil < 2) {
                        typeoffarmer = "Small"
                    }
                    else if (soil < 4) {
                        typeoffarmer = "Semi-Medium"
                    }
                    else if (soil < 10) {
                        typeoffarmer = "Medium"
                    }
                    else {
                        // console.log(soil);
                        typeoffarmer = "Large"
                    }
                    // console.log(typeoffarmer);
                    data.Farmertype = typeoffarmer;

                    data.save().then(() => {

                        // Try to send SMS but don't block signup if it fails
                        try {
                            twilio.messages
                                .create({
                                    from: "+12056289637",
                                    to: "+91" + req.body.Mobilenum,
                                    body: "Farmer ID : " + data.Farmerid,
                                }).then(message => console.log(message.sid))
                                .catch(err => console.log("SMS failed (non-critical):", err.message));
                        } catch (smsErr) {
                            console.log("SMS send failed (non-critical):", smsErr.message);
                        }

                        return res.json({
                            status: "ok",
                            Farmerid: data.Farmerid
                        })
                    })
                }
            })
        }

    } catch (err) {
        if (err) {
            console.log(err);
            res.send({
                status: "error",
                error: "Somthing went wrong !!! Please try again after some time"
            });
        }
    }
};

//Farmer log-in
module.exports.farmer_login = function (req, res) {

    // console.log(req.body);
    try {

        if ((req.body.Farmerid) && (req.body.Password)) {

            farmer_info.findOne({ Farmerid: req.body.Farmerid }, function (err, farmer) {
                // console.log(error);
                if (!farmer) {
                    // return;
                    return res.json({
                        error: "Farmer is not found!!!",
                        status: "error"
                    });
                }
                else if (farmer) {
                    // const validPassword = await bcrypt.compare(req.body.password, farmer.Confirmpass);
                    // console.log(validPassword);
                    // if (!(validPassword)) {
                    if (req.body.Password == farmer.Password) {
                        farm.find({
                            Ownership_Details: {
                                $elemMatch: {
                                    Adharnum: farmer.Adharnum
                                }
                            }
                        }, async function (err, farmdata) {
                            let typeoffarmer = "Marginal"
                            // console.log(data.Adharnum);
                            if (err) {
                                console.log("Error");
                                return res.json({
                                    status: "error",
                                    error: "Something went wrong"
                                })
                            }
                            else {
                                // console.log(farmdata)
                                let soil = 0;
                                for (let i = 0; i < farmdata.length; i++) {
                                    soil = soil + farmdata[i].Hectare;
                                }

                                if (soil < 1) {
                                    typeoffarmer = "Marginal"
                                }
                                else if (soil < 2) {
                                    typeoffarmer = "Small"
                                }
                                else if (soil < 4) {
                                    typeoffarmer = "Semi-Medium"
                                }
                                else if (soil < 10) {
                                    typeoffarmer = "Medium"
                                }
                                else {
                                    // console.log(soil);
                                    typeoffarmer = "Large"
                                }
                                // console.log(typeoffarmer);
                                farmer.Farmertype = typeoffarmer;
                                farmer.save();
                                var farmerObj = farmer.toObject();
                                delete farmerObj.Password;
                                return res.status(200).json(farmerObj);
                            }
                        })

                    }
                    else {
                        return res.json({
                            error: "Password is incorrect!!!",
                            status: "error"
                        });
                    }
                }
            });
        }
        else if ((req.body.Password) && (req.body.Mobilenum)) {
            farmer_info.findOne({ Mobilenum: req.body.Mobilenum }, function (err, farmer) {
                // console.log(err)or);
                // console.log(farmer);
                if (!farmer) {
                    // console.log("First");
                    return res.json({
                        error: "Farmer is not found!!!",
                        status: "error"
                    });
                }

                else if (farmer) {
                    // const validPassword = await bcrypt.compare(req.body.password, farmer.Confirmpass);
                    // console.log(validPassword);
                    // if (!(validPassword)) {
                    if (req.body.Password == farmer.Password) {

                        farm.find({
                            Ownership_Details: {
                                $elemMatch: {
                                    Adharnum: farmer.Adharnum
                                }
                            }
                        }, async function (err, farmdata) {
                            let typeoffarmer = "Marginal"
                            // console.log(data.Adharnum);
                            if (err) {
                                console.log("Error");
                                return res.json({
                                    status: "error",
                                    error: "Something went wrong"
                                })
                            }
                            else {
                                // console.log(farmdata)
                                let soil = 0;
                                for (let i = 0; i < farmdata.length; i++) {
                                    soil = soil + farmdata[i].Hectare;
                                }

                                if (soil < 1) {
                                    typeoffarmer = "Marginal"
                                }
                                else if (soil < 2) {
                                    typeoffarmer = "Small"
                                }
                                else if (soil < 4) {
                                    typeoffarmer = "Semi-Medium"
                                }
                                else if (soil < 10) {
                                    typeoffarmer = "Medium"
                                }
                                else {
                                    // console.log(soil);
                                    typeoffarmer = "Large"
                                }
                                // console.log(typeoffarmer);
                                farmer.Farmertype = typeoffarmer;
                                farmer.save();
                                var farmerObj = farmer.toObject();
                                delete farmerObj.Password;
                                return res.status(200).json(farmerObj);
                            }
                        })

                    }
                    else {

                        return res.json({
                            error: "Password is incorrect!!!",
                            status: "error"
                        });
                    }
                }
            });
        }
        else {
            return res.json({
                error: "Some problem in required Fields!!!",
                status: "error"
            });
        }
    } catch (err) {
        if (err) {
            console.log(err);
            return res.send({
                status: "error",
                eroor: "Something went wrong please try agin after some time"
            });
        }
    }
}

//Forgot password
module.exports.forgotpassword = async function (req, res) {

    try {
        if (req.body.Mobilenum && req.body.Password) {

            farmer_info.findOne({ Mobilenum: req.body.Mobilenum }, async function (err, farmer) {
                // console.log(farmer);
                if (farmer) {

                    await farmer_info.updateOne(
                        {
                            Mobilenum: req.body.Mobilenum,
                        },
                        {
                            $set: {
                                Password: req.body.Password
                            },
                        }
                    );
                    return res.json({
                        "result": "Password Updated succesfully",
                        status: "ok"
                    });
                }
                else {
                    return res.json({
                        error: "Farmer does not exist!!!",
                        status: "error"
                    });
                }

            });

        }
        else {
            return res.json({
                error: "Please enter required fields!!!",
                status: "error"
            });
        }
    } catch (err) {
        if (err) {
            console.log(err);
            return res.json({
                status: "error",
                error: "Something went wrong please try again after some time"
            });
        }
    }
}


//-----Mobile number and adhar card verification------//

//Mobile number verification
module.exports.mobilenumverify = function (req, res) {
    if (req.params.Mobilenum) {
        otp = otpGenerator.generate(4, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
        twilio.messages
            .create({
                from: "+12056289637",
                to: "+91" + req.params.Mobilenum,
                body: "One time password(OTP): " + otp,
            })
            .then(function (message) {
                if (message) {
                    return res.json({
                        OTP: otp,
                        status: "ok"
                    });
                }
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    return res.json({
                        error: "Please enter valid mobile number",
                        status: "error"
                    });
                }
            });
    }
    else {
        return res.json({
            status: "ok",
            error: "Some problem in required fields"
        })
    }
}

//Adhar cad verification and return the mobile
module.exports.adhar = function (req, res) {
    // console.log("Call");
    if (req.body.Adharnum) {
        try {
            adhar_details.findOne({ Adharnum: req.body.Adharnum }, function (err, farmer) {
                if (!farmer) {
                    return res.json({
                        status: "error",
                        error: "Please entre a valid adharcard number !!!"
                    });
                }
                else {
                    return res.json({
                        status: "ok",
                        "Mobilenum": farmer.Mobilenum
                    });
                }
            });
        } catch (error) {
            return res.json({
                status: "error",
                error: "Something went wrong please try after some time !!!"
            });
        };
    }
    else {
        return res.json({
            status: "error",
            error: "Some problem in required fields !!!"
        });
    }
}


//-----Temporary codes of forgot id and whatsapp notification-----//

//temporary code for forgot unique id by farmer
// module.exports.forgotid = function (req, res) {

//     farmer_data.findOne({ Mobilenum: req.body.Mobilenum }, function (err, farmer) {
//         if (err) {
//             return res.json({ "err": "Farmer is not found!!!" });
//         }

//         else if (farmer) {
//             return res.json({ "uniqueid": farmer.Schemeid });
//         }
//     }
//     )
// };


//for sending msg on whatsapp tutorial code
module.exports.temp = function (req, res) {
    const client = require('twilio')(sid, auth_token);


    client.messages
        .create({
            body: 'જય જવાન જય કિશાન',
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+917203955356'
        })
        .then(function (message) {
            if (message) {
                return res.json({
                    status: "ok",
                    result: "Message has been sended"
                });
            }
        }).catch(function (err) {
            if (err) {
                return res.json({
                    error: "Something went wrong please try again after some time",
                    status: "error"
                });
            }
        })
        .done();
}



//-----Schems system for farmers-----//

//All schems for farmers apply
module.exports.applicationofscheme = function (req, res) {
    scheme_details.find({
        Farmers: {
            $elemMatch: {
                Farmerid: req.params.Farmerid,
                Status: "Applied"
            }
        },
    }, "Title Expired Schemeid", function (err, schemes) {
        if (!schemes) {
            return res.json({
                status: "error",
                error: "Unable to find schemes"
            });
        }
        else {
            return res.json(schemes);
        }
    });
}

//All schemes for farmer is Eligible 
module.exports.eligibleschemes = function (req, res) {
    try {
        //Here we use main database of schemes where we use Schemeid to find more information of perticular scheme
        scheme_details.find({ Category: req.params.Category, Farmertype: req.params.Farmertype, Status: "Active", Expired: { '$gte': (new Date()) } }, "Title Expired Schemeid", function (err, schemes) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Unable to find schemes"
                });
            }
            else {
                // console.log(schemes);
                // console.log("xxxx");
                scheme_details.find({
                    Farmers: {
                        $elemMatch: {
                            Farmerid: req.params.Farmerid
                        }
                    }
                }, "Title Expired Schemeid", function (err, appliedschemes) {
                    if (!appliedschemes) {
                        return res.json({
                            Status: "error"
                        });
                    }
                    else {
                        if (appliedschemes.length == 0) {
                            return res.json(schemes);
                        }
                        else {
                            let responce = []
                            for (let i = 0; i < schemes.length; i++) {
                                let flag = 1;
                                for (let j = 0; j < appliedschemes.length; j++) {
                                    if ((schemes[i]).Schemeid == (appliedschemes[j].Schemeid)) {
                                        flag = 0;
                                        break;
                                    }
                                }
                                if (flag == 1) {
                                    responce.push(schemes[i]);
                                }
                            }
                            return res.json(responce);
                        }
                    }
                });

            }
        });
    } catch (err) {
        console.log(err)
        return res.json({
            status: "error",
            error: "Something went wrong....please try again after some time..."
        });
    }
}

//API to apply for scheme
module.exports.applyforscheme = function (req, res) {
    try {
        scheme_details.findOne({ Schemeid: req.params.Schemeid }, async function (err, present) {
            if (err) {
                console.log(err);
                return res.send({
                    status: "error",
                    error: "Something went wrong please try again after some time"
                });
            }
            else {
                farmer_info.findOne({ Farmerid: req.params.Farmerid }, function (err, farmerdata) {
                    if (err) {
                        console.log(err);
                        return res.json({
                            status: "error",
                            error: "Something went wrong"
                        })
                    }
                    else {
                        let application = {
                            Farmerid: req.params.Farmerid,
                            Name: farmerdata.Name,
                            Category: farmerdata.Category,
                            Farmertype: farmerdata.Farmertype,
                            District: farmerdata.District,
                            Taluka: farmerdata.Taluka,
                            Village: farmerdata.Village
                        }
                        present.Applied = present.Applied + 1;
                        present.Farmers.push(application);
                        // console.log(present.Farmers);
                        //here we update number of application in scheme details
                        // console.log("vk");
                        present.save().then(() => {
                            return res.json({
                                status: "ok",
                                result: "Your application has been submited"
                            });
                        }).catch(err => {

                            console.log(err);
                            return res.send({
                                status: "error",
                                error: "Something went wrong"
                            });
                        })
                    }
                })

            }
        });
    } catch (err) {
        if (err) {
            console.log(err);
            return res.json({
                error: "Something went wrong",
                status: "error"
            });
        }
    }

}

//list of approved schemes for perticular Farmer
module.exports.approvedschemes = function (req, res) {
    scheme_details.find({
        Farmers: {
            $elemMatch: {
                Farmerid: req.params.Farmerid,
                Status: "Approved"
            }
        },
    }, "Title Expired Schemeid", function (err, schemes) {
        if (!schemes) {
            return res.json({
                status: "error",
                error: "Unable to find schemes"
            });
        }
        else {
            return res.json(schemes);
        }
    });
}

//list of rejected schemes for perticular farmer
module.exports.rejectedschemes = function (req, res) {
    scheme_details.find({
        Farmers: {
            $elemMatch: {
                Farmerid: req.params.Farmerid,
                Status: "Reject"
            }
        },
    }, "Title Expired Schemeid", function (err, schemes) {
        if (!schemes) {
            return res.json({
                status: "error",
                error: "Unable to find schemes"
            });
        }
        else {
            return res.json(schemes);
        }
    });
}

module.exports.bills_farmers = function (req, res) {
    try {
        bill.find({ Party: req.params.Farmerid }, function (err, data) {
            if (err) {
                console.log(err);
                return res.send({
                    status: "error",
                    error: "Something went wrong please try again after some time"
                });
            }
            else {
                return res.json(data);
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.send({
            status: "error",
            error: "Something went wrong please try again after some time"
        });
    }
}

module.exports.day_wise_price = async function (req, res) {
    try {
        let dates = await bill.distinct("Bill_date");

        let final_data = [];

        for (let i = 0; i < dates.length; i++) {
            let data = await bill.find({ Bill_date: dates[i], Bill_type: "Buyer" }).sort({ Rate: 1 });
            let total_buy = 0;
            // let total_sell =0;
            console.log(data)
            let max = data[data.length - 1].Rate;
            let min = data[0].Rate;

            for (let j = 0; j < data.length; j++) {
                total_buy = data[i].Bags + total_buy
            }

            let p = {

            }
            p["Date"] = dates[i]
            p["max"] = max
            p["min"] = min
            p["total_buy"] = total_buy

            final_data.push(p);

        }
        return res.json(final_data);
    }
    catch (err) {
        console.log(err);
        return res.send({
            status: "error",
            error: "Something went wrong please try again after some time"
        });
    }
}