const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  lender: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['KCC', 'Crop Loan', 'Agricultural Term Loan', 'Gold Loan', 'Other'],
    default: 'Crop Loan'
  },
  principal: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number, // In months
    required: true
  },
  outstanding: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'rejected', 'pending'],
    default: 'active'
  },
  sanctionDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
