const crop_history = require('../models/crop_history_form');
const farm_data = require('../models/farm');
const farmer_info = require('../models/farmer_info');

module.exports.crop_history_form = async function (req, res) {
    try {
        let date = new Date(req.body.Sow_date);
        // console.log("date",date);
        date = date.getFullYear();
        crop_history.findOne({ Year: date, Season: req.body.Season, UPIN: req.body.UPIN }, async function (err, present) {
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
                        error: "Form has been allready filled"
                    }
                )
            }
            else {
                let farm = await farm_data.findOne({ UPIN: req.body.UPIN });
                let Name = await farmer_info.findOne({Farmerid : req.body.Farmerid},"Name");
                console.log(Name);
                console.log(req.body);
                let data = {
                    Farmerid : req.body.Farmerid,
                    Farmername : Name.Name,
                    UPIN: req.body.UPIN,
                    Soil_type: req.body.Soil_type,
                    Season: req.body.Season,
                    Crop: req.body.Crop,
                    Ratio: req.body.Ratio,
                    Irigation_sources_used: req.body.Irigation_sources_used,
                    Sow_date: req.body.Sow_date,
                    Harvest_date: req.body.Harvest_date,
                    Production: req.body.Pro,
                    Year: date
                }

                // console.log(farm);
                data["Hectare"] = farm.Hectare;
                data["Are"] = farm.Are
                data["Square_meteres"] = farm.Square_meters
                data["District"] = farm.District
                data["Taluka"] = farm.Taluka
                data["Village"] = farm.Village



                const newdata = await crop_history.create(data);
                return res.json({
                    status: "ok",
                    data: newdata
                })
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

//here we get records which is added by farmer
module.exports.crop_history = async function (req, res) {
    try {
        crop_history.find({ UPIN: req.params.UPIN }, function (err, data) {
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