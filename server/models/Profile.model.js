const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  farmerId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  fullName: { type: String },
  fatherName: { type: String },
  dateOfBirth: { type: Date },
  gender: { 
    type: String,
    enum: ['Male', 'Female', 'Other', 'Pending'],
    default: 'Pending'
  },
  category: { 
    type: String, 
    enum: ['SC', 'ST', 'OBC', 'GENERAL', 'EWS', 'Pending'],
    default: 'Pending'
  },
  physicalHandicap: { 
    type: String, 
    default: 'None' 
  },
  qualification: { 
    type: String 
  },
  rationCardCategory: { 
    type: String 
  },
  rationCardNumber: { 
    type: String 
  },
  address: {
    state: { type: String, default: 'Gujarat' },
    district: { type: String },
    taluka: { type: String },
    village: { type: String },
    pincode: { type: String },
    fullAddress: { type: String }
  },
  bankDetails: {
    accountNo: { type: String },
    ifsc: { type: String },
    bankName: { type: String }
  },
  interestInContractFarming: { 
    type: Boolean, 
    default: false 
  },
  landRecords: [{
    surveyNo: { type: String },
    areaInAcres: { type: Number },
    village: { type: String },
    taluka: { type: String },
    district: { type: String },
    soilType: { type: String }
  }],
  documents: [{
    type: { type: String, enum: ['Aadhaar', 'ROR', 'BankPassbook', 'Other'] },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  completionPercentage: { type: Number, default: 0 },
  farmSize: { type: Number, default: 0 },
  cropsGrown: [{ type: String }]
}, { timestamps: true });

// Pre-save hook to ensure farmerId matches the User's farmerId if it's a farmer role
profileSchema.pre('save', async function(next) {
  if (this.isModified('user')) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    if (user && user.role === 'farmer' && user.farmerId) {
      this.farmerId = user.farmerId;
    }
  }
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
