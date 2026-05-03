const mongoose = require('mongoose');

const insurancePolicySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: String },
  
  policyNumber: { type: String, required: true },
  policyName: { type: String, required: true },
  provider: { type: String, required: true },         // "Agriculture Insurance Co", "ICICI Lombard", etc.
  schemeName: { type: String },                        // "PMFBY", "WBCIS", etc.
  
  // Coverage details
  cropsCovered: [{ type: String }],
  season: { type: String, enum: ['Kharif', 'Rabi', 'Summer', 'All'] },
  coverageAmount: { type: Number },                    // Sum insured
  premiumAmount: { type: Number },
  subsidyPercentage: { type: Number, default: 0 },
  farmerPremium: { type: Number },                     // After subsidy
  
  // Area
  landArea: { type: Number },                          // in acres
  surveyNo: { type: String },
  village: { type: String },
  district: { type: String },
  
  // Dates
  startDate: { type: Date },
  endDate: { type: Date },
  applicationDate: { type: Date, default: Date.now },
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'expired', 'claimed', 'pending', 'rejected'],
    default: 'pending'
  },
  
  // Claim details
  claimDetails: {
    claimId: { type: String },
    claimDate: { type: Date },
    claimAmount: { type: Number },
    claimReason: { type: String },
    claimStatus: { type: String, enum: ['pending', 'processing', 'approved', 'rejected', 'paid'] },
    settledAmount: { type: Number },
    settledDate: { type: Date }
  }
}, { timestamps: true });

insurancePolicySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('InsurancePolicy', insurancePolicySchema);
