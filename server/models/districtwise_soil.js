const mongoose = require("mongoose");

const districtwise_soil = new mongoose.Schema(
    {
       District :{
        type : String
       },
       Types_of_soil :[
        {
            Soil : {
                type : String
            },
            Area :{
                type : Number
            },
            Persantage:{
                type : Number
            }
        }
       ]
    }
);

const Districtwise_soil = mongoose.model("Districtwise_soil", districtwise_soil);

module.exports = Districtwise_soil;