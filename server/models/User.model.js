const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  farmerId: { 
    type: String, 
    unique: true, 
    sparse: true // Only for farmers
  },
  fullName: { 
    type: String 
  },
  aadhaarNumber: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  phone: { 
    type: String, 
    unique: true, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['farmer', 'trader', 'admin', 'govt', 'expert'], 
    default: 'farmer' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  refreshToken: { 
    type: String 
  },
  district: { 
    type: String 
  },
  taluka: { 
    type: String 
  },
  // Compatibility with existing chat feature
  picture: {
    type: String
  },
  newMessages: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    default: 'online'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { minimize: false, timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive info when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);
