const mongoose = require("mongoose");

const scheme_details = new mongoose.Schema(
    {
        Title: {
            require : true,
            type: String
        },
        Schemeid :{
            type : String
        },
        Description: {
            type: String
        },
        Benefits: {
            type: String
        },
        How: {
            type: String
        },
        More: {
            type: String
        },
        Start: {
            type: Date,
            default : new Date()
        },
        Expired: {
            type: Date
        },
        Category :{
            type: Array
        },
        Farmertype:{
            type : Array
        },
        Applied: {
            type: Number,
            default  : 0
        },
        Approved:{
            type : Number,
            default  : 0
        },
        Reject:{
            type : Number,
            default : 0
        },
        Status :{
            type : String,
            // 1 is active and 0 is deleted
            default : "Active"
        },
        Farmers: [
            {
                Farmerid: {
                    type: String
                },
                Name : {
                    type : String
                },
                Category :{
                    type : String
                },
                Farmertype : {
                    type : String
                },
                District : {
                    type : String
                },
                Taluka:{
                    type : String
                },
                Village : {
                    type : String
                },
                Status: {
                    type: String,
                    default: "Applied"
                },
                Applieddate:{
                    type : Date,
                    default : new Date()
                },
                Reponcedate:
                {
                    type : String,
                    default : "Pending"
                }
            },
        ],  

    },{
        timestamps : true
    }
);

const Scheme_details = mongoose.model("Scheme details", scheme_details);

module.exports = Scheme_details;
