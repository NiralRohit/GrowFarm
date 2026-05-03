const district = require('../models/district');

//To get the talukas of perticular district
module.exports.taluka = function(req,res)
{
    district.distinct("Taluka",{District : req.params.District},function(err,data)
    {
        if(err)
        {
            return res.json({Error : "Something went wrong please try again after some time"});
        }
        else{

            return res.send(data);
        }
    });
}

//To get the villages of perticular talukas
module.exports.village = function(req,res)
{
    district.distinct("Village",{District : req.params.District , Taluka : req.params.Taluka},function(err,data)
    {
        if(err)
        {
            return res.json({Error : "Something went wrong please try again after some time"}); /////////////////////How to handle error/////////////////
        }
        else{
            return res.send(data);
        }
    });
;}