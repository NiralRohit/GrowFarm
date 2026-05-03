const mongoose = require("mongoose");

const expert = new mongoose.Schema(
    {
        Email:{
            type : String
        },
        Name :{
            type : String
        },
        Mobile_no :{
            type : Number
        },
        Password:{
            type : String
        }
    }
);

const Expert = mongoose.model("expert", expert);

module.exports = Expert;