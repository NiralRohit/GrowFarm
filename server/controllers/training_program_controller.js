const training = require('../models/training_program')
const uniqueid = require('generate-unique-id');
const farmer_info = require('../models/farmer_info')

module.exports.add_new_training = async function (req, res) {
    try {

        training.findOne({ Title: req.body.Title }, async function (err, present) {
            if (err) {
                console.log(err);
                return res.json(
                    {
                        status: "error",
                        error: "Something went wrong"
                    }
                )
            }
            else if (present) {
                return res.json(
                    {
                        status: "error",
                        error: "Training is allready present"
                    }
                )
            }
            else {
                var data = new training(req.body);
                let genretedid = uniqueid({
                    length: 8,
                    useLetters: false
                });
                data.Trainingid = genretedid;
                data.save().then(() => {
                    // console.log(data.Category);
                    // farmer_info.find({ Category: data.Category, Farmertype: data.Farmertype, Fake: false }, function (err, farmer) {
                    //     // console.log(farmer.length);
                    //     for (let i = 0; i < farmer.length; i++) {
                    //         // console.log(farmer[i].Mobilenum);
                    //         client.messages
                    //             .create({
                    //                 body: data.Title + "\nDescription:\n" + data.Description + "\nHow to get benefits of the Scheme\n" + data.How + "\nFor more details click on the link:" + data.More + "\nExpired date:" + data.Expired,
                    //                 from: 'whatsapp:+14155238886',
                    //                 to: 'whatsapp:+91' + farmer[i].Mobilenum
                    //             })
                    //             .then(message => console.log(message.sid))
                    //             .catch(function (err) {
                    //                 if (err) {
                    //                     return res.json({
                    //                         error: "Something went wrong please try again after some time",
                    //                         status: "error"
                    //                     });
                    //                 }
                    //             })
                    //         // .done();
                    //     }
                    //     // console.log(count);
                    //     return res.json({
                    //         status: "ok",
                    //         result: "//Scheme added sucessfully//"
                    //     })
                    // })
                    return res.json({
                        status: "ok",
                        result: "//Training added sucessfully//"
                    })
                });
            }

        });
        // console.log("year",date);


    }
    catch (err) {
        console.log(err);
        return res.json(
            {
                status: "error",
                error: "Something went wrong"
            }
        )
    }
}

module.exports.list_of_training_Active = function (req, res) {
    try {
        training.find({Status: "Active",Expired : {'$gte' : (new Date())}}, function (err, data) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                return res.json(data);
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        });
    }
}

module.exports.list_of_expired = function(req,res)
{
    try {
        training.find({Status: "Active",Expired : {'$lt' : (new Date())}}, function (err, data) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                return res.json(data);
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        });
    }
}

module.exports.list_of_deleted = function(req,res)
{
    try{
        training.find({Status : "deleted"},function(err,data)
        {
            if(err)
            {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                }); 
            }
            else{
                return res.json(data);
            }
        });
    }
    catch(err)
    {
        console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
    }
}

module.exports.list_of_training_deleted = function (req, res) {
    try {
        training.find({Status: "Deleted"}, function (err, data) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                return res.json(data);
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: "error",
            error: "Something went wrong"
        });
    }
}

module.exports.delete_training = function(req,res)
{
    try {

        training.findOne({ Trainingid: req.params.Trainingid }, function (err, trainings) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Unable to delete scheme !!!"
                });
            }
            else {
                trainings.Status = "Deleted";
                trainings.save();
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

module.exports.apply_for_training = function (req, res) {
    try {
        training.findOne({ Trainingid: req.params.Trainingid }, async function (err, present) {
            if (err) {
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

module.exports.list_of_applications_admin= function(req,res)
{
    try {
        training.findOne({ Trainingid: req.params.Trainingid }, "Farmers", function (err, application) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                });
            }
            else {
                return res.json(application);
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

module.exports.list_of_training_farmer = function(req,res)
{
    try {
        //Here we use main database of schemes where we use Trainingid to find more information of perticular scheme
        training.find({Status: "Active" ,  Expired : {'$gte' : (new Date())}}, "Title Expired Trainingid", function (err, trainings) {
            if (err) {
                return res.json({
                    status: "error",
                    error: "Unable to find schemes"
                });
            }
            else {
                // console.log(schemes);
                // console.log("xxxx");
                training.find({
                    Farmers: {
                        $elemMatch: {
                            Farmerid: req.params.Farmerid
                        }
                    }
                }, "Title Expired Trainingid" ,function (err, appliedstraining) {
                    if (!appliedstraining) {
                        return res.json({
                            Status: "error"
                        });
                    }
                    else {
                        if (appliedstraining.length == 0) {
                            return res.json(trainings);
                        }
                        else {
                            let responce = []
                            for (let i = 0; i < trainings.length; i++) {
                                let flag = 1;
                                for (let j = 0; j < appliedstraining.length; j++) {
                                    if ((trainings[i]).Trainingid == (appliedstraining[j].Trainingid)) {
                                        flag = 0;
                                        break;
                                    }
                                }
                                if(flag == 1)
                                {
                                    responce.push(trainings[i]);
                                }
                            }
                            return res.json(responce);
                        }
                }    });
                
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