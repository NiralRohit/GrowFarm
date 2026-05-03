const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNo: { 
    type: String, 
    required: true, 
    unique: true 
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  trader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  cropName: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },
  unit: { 
    type: String, 
    default: 'Quintal' 
  },
  rate: { 
    type: Number, 
    required: true 
  },
  netPayable: { 
    type: Number, 
    required: true 
  },
  grade: { 
    type: String, 
    enum: ['A', 'B', 'C'], 
    default: 'A' 
  },
  transactionDate: { 
    type: Date, 
    default: Date.now 
  },
  pdfUrl: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
