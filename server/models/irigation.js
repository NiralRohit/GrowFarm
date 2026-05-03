const mongoose = require("mongoose");

const irigation = new mongoose.Schema(
    {
       District :{
        type : String
       },
       Canals :{
        type : Number
       },
       Tank:{
        type : Number
       },
       Tubewells:{
        type : Number
       },
       Other_Wells:{
        type : Number
       },
       Other_Sources:{
        type : Number
       },
       Total:{
        type : Number
       },
       Gross_Cropped_Area :{
        type : Number
       },
       Year:{
        type : Number
       }
    }
);

const Irigation = mongoose.model("irigation",irigation);

module.exports = Irigation;