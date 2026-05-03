const mongoose = require("mongoose");

const insurance_company = new mongoose.Schema(
    {
        Username:{
            // unique : true,
            type : String
        },
        Password:{
            // unique : true,
            type : String
        }
    }
);

const Insurance_company = mongoose.model("insurance_company", insurance_company);

module.exports = Insurance_company;