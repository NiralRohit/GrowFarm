const mongoose = require("mongoose");

const farm = new mongoose.Schema(
    {
        District:{
            type : String
        },
        Taluka:{
            type : String
        },
        Village : 
        {
            type : String
        },
        Surveynumber : 
        {
            type : Number
        },
        UPIN : 
        {
            type : Number
        },
        Oldsurveynumber : 
        {
            type : Number
        },
        Hectare : 
        {
            type : Number
        },
        Are : 
        {
            type : Number
        },
        Square_meters : 
        {
            type : Number
        },
        Totalassessmentrs : 
        {
            type : String
        },
        Landusefor :{
            type : String
        },
        Farmname :{
            type : String
        },
        Khatanum :{
            type : Number
        },
        Ownership_Details :[
            {
                Farmername : {
                    type : String
                },
                Adharnum : {
                    type : Number
                }

            }
        ],
        OtherRightsDetails :[
            {
                type : String
            }
        ]

    }
);

const Farm = mongoose.model("farm", farm);

module.exports = Farm;