const mongoose = require("mongoose");

const bill_details = new mongoose.Schema(
    {
        Bill_type :{
            type : String
        },
        Party :{
            type : String
        },
        GST_No:{
            type : String
        },
        Trade_name:{
            type : String
        },
        Name : {
            type : String
        },
        Mobile :{
            type : String
        },
        Crop :{
            type : String
        },
        Bill_date :{
            type : Date
        },
        // Bill_no :{
        //     type : Number
        // },
        Bags :{
            type : Number
        },
        Kgs :{
            type : Number
        },
        Rate : {
            type : Number
        },
        Amount :{
            type : Number
        },
        Commission_cost :{
            type : Number
        },
        Labour_cost :{
            type : Number
        },
        CGST:{
            type : Number
        },
        SGST :{
            type : Number
        },
        Bill_Amount :{
            type : Number
        }
    }
);

const Bill_details = mongoose.model("bill_details", bill_details);

module.exports = Bill_details;