const farm = require('../models/farm');
const farmer_info = require('../models/farmer_info');

module.exports.allfarminfo = function (req, res) {
    try {
        farm.find({}, function (err, data) {
            if (err) {
                console.log(err);
                return res.json({
                    status: "error",
                    error: "Something went wrong"
                })
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
        })
    }
}

module.exports.farminfo = function (req, res) {
    try {
        farm.find({
            Ownership_Details: {
                $elemMatch: {
                    Adharnum: req.params.Adharnum
                }
            }
        }, function (err, data) {
            return res.json(data);
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

module.exports.updatefarmertype = function (req, res) {
    try {
        farmer_info.findOne({ Farmerid: req.params.Farmerid }, function (err, farmer) {
            farm.find({
                Ownership_Details: {
                    $elemMatch: {
                        Adharnum: req.params.Adharnum
                    }
                }
            }, function (err, data) {
                let soil = 0;
                for (let i = 0; i < data.length; i++) {
                    soil = soil + data[i].Hectare;
                }
                if (soil < 1) {
                    farmer.Farmertype = "Marginal"
                }
                else if (soil < 2) {
                    farmer.Farmertype = "Small"
                }
                else if (soil < 4) {
                    farmer.Farmertype = "Semi-Medium"
                }
                else if (soil < 10) {
                    farmer.Farmertype = "Medium"
                }
                else {
                    farmer.Farmertype = "Large"
                }

                farmer.save().then(()=>{
                    return res.json({
                        status: "ok",
                        result: "Updated"
                    });
                });
            })
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

