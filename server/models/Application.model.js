const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scheme: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Scheme', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'In Review', 'Approved', 'Rejected'], 
    default: 'Submitted' 
  },
  landSurveyNo: { type: String }, // Relevant for land-based schemes
  appliedOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  adminRemarks: { type: String },
  documents: [{
    type: { type: String }, // 'ROR', 'Aadhaar'
    url: { type: String }
  }]
}, { timestamps: true });

// Ensure a user can only apply once per scheme (unless rejected/cancelled)
applicationSchema.index({ user: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
