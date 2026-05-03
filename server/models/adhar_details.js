const mongoose = require("mongoose");

const adhar_details = new mongoose.Schema(
    {
        Mobilenum:{
            // unique : true,
            type : Number
        },
        Adharnum:{
            // unique : true,
            type : Number
        }
    }
);

const adhar_detail = mongoose.model("Adhar details", adhar_details);

module.exports = adhar_detail;