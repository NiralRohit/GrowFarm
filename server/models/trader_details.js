const mongoose = require("mongoose");

const trader_details = new mongoose.Schema(
    {
        GST_No:{
            type : String
        },
        Password : {
            type : String
        }
    }
);

const trader_detail = mongoose.model("trader details", trader_details);

module.exports = trader_detail;