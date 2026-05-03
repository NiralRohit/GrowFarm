const mongoose = require("mongoose");

const apydata = new mongoose.Schema(
    {
        District :{
            type : String
        },
        Area : {
            type : Number
        },
        Prod : {
            type :Number
        },
        Yield : {
            type :Number
        },
        Crop : {
            type : String
        },
        Year : {
            type : Number
        }
    }
);

const Apydata = mongoose.model("apydata",apydata);

module.exports = Apydata;