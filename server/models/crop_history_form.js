const mongoose = require("mongoose");

const crop_history = new mongoose.Schema(
    {
        Farmername :{
            type : String
        },
        UPIN :{
            type : Number   
        },
        Farmerid :{
            type : String
        },
        Hectare :{
            type : Number
        },
        Are :{
            type : Number
        },
        Square_meteres :{
            type : Number
        },
        Soil_type:{
            type :String
        },
        Season :{
            type : String
        },
        Crop :{
            type : Array
        },
        Ratio : {
            type : Array
        },
        Irigation_sources_used :{
            type : String
        },
        Sow_date:{
            type :Date
        },
        Harvest_date : {
            type : Date
        },
        Production : {
            type : Array
        },
        District :{
            type : String
        },
        Taluka : {
            type : String
        },
        Village :{
            type : String   
        },
        Year :{
            type : Number
        }
    }
);

const Crop_history = mongoose.model("crop_history", crop_history);

module.exports = Crop_history;