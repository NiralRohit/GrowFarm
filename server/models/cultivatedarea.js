const mongoose = require("mongoose");

const cultivatedarea = new mongoose.Schema(
    {
        District:{
            type : String
        },
        Total_Geographical_Area:{
            type : Number
        },
        Total_Reporting_Area:{
            type : Number
        },
        Total_Forest:{
            type : Number
        },
        Gross_Cropped_Area:{
            type : Number
        },
        Total_Non_Cultivated_Area:{
            type : Number
        },
        Year:{
            type : Number
        }
    }
);

const Cultivatedarea = mongoose.model("cultivatedarea",cultivatedarea);

module.exports = Cultivatedarea;