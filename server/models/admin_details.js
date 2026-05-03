const mongoose = require("mongoose");

const admin_details = new mongoose.Schema(
    {
        Username:{
            unique : true,
            type : String
        },
        Password:{
            type : String
        }
    }
);

const Admin_detail = mongoose.model("Admin details", admin_details);

module.exports = Admin_detail;