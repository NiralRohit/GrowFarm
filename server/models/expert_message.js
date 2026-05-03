const mongoose = require('mongoose');

const expert_message = new mongoose.Schema({
  content: {
    type : String
  },
  roomid :{
    type : String
  },
  From  :{
    type : String
  },
  // socketid: String,
  time:{
    type : Date,
    default : new Date()
  },
  to:{
    type : String
  },
  expert_email :{
    type :String
  },
  Farmer_number:{
    type : Number
  }
})

const Expert_message = mongoose.model('expert_message', expert_message);

module.exports = Expert_message
