const mongoose = require("mongoose");

const training_program = new mongoose.Schema(
    {
        Title: {
            require : true,
            type: String
        },
        Trainingid :{
            type : String
        },
        Description: {
            type: String
        },
        Start: {
            type: Date,
            default : new Date()
        },
        complition :{
            type: Date
        },
        Expired: {
            type: Date
        },
        Applied: {
            type: Number,
            default  : 0
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
                Applieddate:{
                    type : Date,
                    default : new Date()
                }
            },
        ],  

    },{
        timestamps : true
    }
);

const training_programs = mongoose.model("training_program", training_program);

module.exports = training_programs;
