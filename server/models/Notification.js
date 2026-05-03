const mongoose = require('mongoose');

const notification = new mongoose.Schema({
  content: {
    type : String
  },
  from  :{
    type : String,
    default : "Admin"
  },
  // socketid: String,
  time:{
    type : Date,
    default : new Date()
  },
  to:{
    type : String
  }
})

const Notification = mongoose.model('notification', notification);

module.exports = Notification
