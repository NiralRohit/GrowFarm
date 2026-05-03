const mongoose = require("mongoose");

const apmc_login = new mongoose.Schema(
    {
        Username:{
            type : String
        },
        Password:{
            type : String
        }
    }
);

const APMC_login = mongoose.model("APMC_login", apmc_login);

module.exports = APMC_login;