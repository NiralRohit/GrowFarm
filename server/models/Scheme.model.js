const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  eligibility: {
    district: [{ type: String }], // 'All' or specific districts like ['Ahmedabad', 'Surat']
    minFarmSize: { type: Number, default: 0 },
    maxFarmSize: { type: Number, default: 9999 },
    crops: [{ type: String }],    // ['Cotton', 'Wheat'] or ['Any']
    roles: [{ type: String, enum: ['farmer', 'trader', 'admin', 'govt'], default: ['farmer'] }]
  },
  benefits: { 
    type: String, 
    required: true 
  },
  documentsRequired: [{ type: String }], // ['Aadhaar', 'ROR', 'BankPassbook']
  subsidyPercentage: { type: Number, default: 0 },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', schemeSchema);
