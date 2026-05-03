const mongoose = require("mongoose");
const validator = require("validator");

const farmer_info = new mongoose.Schema(
    {
        Farmerid: {
            type: String,
            unique: true
        },
        Name: {
            type: String
        },
        Gender: {
            type: String,
            default : "Female"
        },
        Category: {
            type: String
        },
        Qualification: {
            type: String
        },
        Dateofbirth: {
            type: Date
        },
        Physical_handicap:{
            type: String
        },
        Adharnum: {
            //Adharnum 
            type: Number
        },
        Rationcardcategory: {
            type: String
        },
        Rationcardnum: {
            type: Number
        },
        State: {
            type: String,
            default : "Gujarat"
        },
        District: {
            type: String
        },
        Taluka: {
            type: String
        },
        Fake:{
            type : Boolean,
            default : false
        },
        Village: {
            type: String
        },
        Pincode :{
            type : Number
        },
        Address: {
            type: String
        },
        Mobilenum: {
            type: Number,
            unique: true
        },
        Email: {
            type: String,
            // validate: [validator.isEmail, "Please Enter a valid Email"],
        },
        Bankname: {
            type: String
        },
        IFSC: {
            type: String
        },
        Accountnum: {
            type: Number
        },
        Farmertype: {
            type: String
        },
        Password: {
            type: String
        },
        Contract_Farming : {
            type : String,
            default : "No"
        }
    },
    {
        collection: "Farmer's information",
        timestamps: true//contain the record of updation timinig 
    }
);

const farmers_info = mongoose.model("Farmer's information", farmer_info);

module.exports = farmers_info;