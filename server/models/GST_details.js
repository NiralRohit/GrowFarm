const mongoose = require("mongoose");

const GST_details = new mongoose.Schema(
    {
        GST_No:{
            unique : true,
            type : String
        },
        Trade_Name :{
            type : String
        },
        Name : {
            type : String
        },
        Mobile :{
            type : Number
        },
        Email :{
            type : String
        },
        District:{
            type : String
        },
        Taluka :{
            type : String
        },
        Administrative_Office :{
            type : String
        }
    }
);

const GST_detail = mongoose.model("GST details", GST_details);

module.exports = GST_detail;