const mongoose = require("mongoose");

const district = new mongoose.Schema(
    {
       District :{
        type : String
       },
       Taluka :{
        type : String
       },
       Village:{
        type : String
       }
    }
);

const District = mongoose.model("District", district);

module.exports = District;