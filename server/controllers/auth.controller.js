const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User.model');
const authConfig = require('../config/auth.config');
const { generateOtp, sendOtp } = require('../utils/otp.utils');
const { generateFarmerId, validateDistrict } = require('../utils/idGenerator.utils');
const redis = require('../utils/redis.utils');

// Zod Schemas for validation
const registerSchema = z.object({
  // Auth
  phone: z.string().min(10).max(15),
  password: z.string().min(6),
  role: z.enum(['farmer', 'trader', 'admin', 'govt', 'expert']).default('farmer'),
  email: z.string().optional().default(''),
  
  // Personal
  fullName: z.string().optional().default(''),
  gender: z.string().optional().default(''),
  dob: z.string().optional().default(''),
  category: z.string().optional().default(''),
  handicap: z.string().optional().default('None'),
  qualification: z.string().optional().default(''),
  rationCardCategory: z.string().optional().default(''),
  rationCardNumber: z.string().optional().default(''),
  
  // Location
  district: z.string().optional().default(''),
  taluka: z.string().optional().default(''),
  village: z.string().optional().default(''),
  pincode: z.string().optional().default(''),
  fullAddress: z.string().optional().default(''),
  
  // Bank
  bankName: z.string().optional().default(''),
  ifsc: z.string().optional().default(''),
  accountNo: z.string().optional().default(''),
  confirmAccountNo: z.string().optional().default(''),
  
  // Extra
  aadhaarNumber: z.string().optional().default(''),
  contractFarming: z.any().optional().default(false),

  // Extra fields (ignored but accepted)
  confirmPassword: z.string().optional(),
  state: z.string().optional()
});

const loginSchema = z.object({
  phone: z.string(),
  password: z.string()
});

/**
 * Generate Access and Refresh Tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, farmerId: user.farmerId },
    authConfig.JWT_ACCESS_SECRET,
    { expiresIn: authConfig.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    authConfig.JWT_REFRESH_SECRET,
    { expiresIn: authConfig.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

/**
 * Send OTP for verification
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number required" });

    const otp = generateOtp();
    const success = await sendOtp(phone, otp);

    if (success) {
      // Store OTP in Redis for 5 minutes
      await redis.setWithTtl(`otp:${phone}`, otp, 300);
      return res.status(200).json({ message: "OTP sent successfully" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Validation failed", errors: validation.error.errors });
    }

    const { 
      phone, password, role, district, taluka, aadhaarNumber, fullName, email,
      gender, dob, category, handicap, qualification, rationCardCategory, rationCardNumber,
      village, pincode, fullAddress, bankName, ifsc, accountNo, contractFarming
    } = validation.data;

    // Validate District (skip for expert role)
    if (role !== 'expert' && !validateDistrict(district)) {
      return res.status(400).json({ message: `Invalid district: ${district}` });
    }

    // Check if user already exists
    const query = { $or: [{ phone }] };
    if (aadhaarNumber && aadhaarNumber.trim() !== "") query.$or.push({ aadhaarNumber });
    if (email && email.trim() !== "") query.$or.push({ email });

    const existingUser = await User.findOne(query);
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone, Aadhaar or email already exists" });
    }

    // Convert empty string or whitespace to undefined so sparse index works
    const finalAadhaar = aadhaarNumber && aadhaarNumber.trim() !== "" ? aadhaarNumber : undefined;
    const finalEmail = email && email.trim() !== "" ? email : undefined;

    // Generate unique farmer ID if role is farmer
    let farmerId = undefined;
    if (role === 'farmer') {
      const count = await User.countDocuments({ district, role: 'farmer' });
      farmerId = generateFarmerId(district, count + 1);
    }

    const user = new User({
      phone,
      password,
      role,
      district,
      taluka,
      fullName,
      email: finalEmail,
      aadhaarNumber: finalAadhaar,
      farmerId,
      isVerified: true // Set to true to allow immediate login for development
    });

    await user.save();

    // Create Profile immediately
    const Profile = require('../models/Profile.model');
    const profile = new Profile({
      user: user._id,
      farmerId,
      fullName,
      gender: gender && gender.trim() !== "" ? gender : 'Pending',
      dateOfBirth: dob ? new Date(dob) : undefined,
      category: category && category.trim() !== "" ? category : 'Pending',
      physicalHandicap: handicap,
      qualification,
      rationCardCategory,
      rationCardNumber,
      address: {
        district,
        taluka,
        village,
        pincode,
        fullAddress
      },
      bankDetails: {
        accountNo,
        ifsc,
        bankName
      },
      interestInContractFarming: contractFarming
    });

    await profile.save();

    return res.status(201).json({
      message: "User registered successfully",
      farmerId: user.farmerId
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Verify OTP and activate user
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP required" });

    const storedOtp = await redis.get(`otp:${phone}`);
    
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate({ phone }, { isVerified: true }, { new: true });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up OTP
    await redis.del(`otp:${phone}`);

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: "Phone verified successfully",
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid input format", 
        errors: validation.error.errors 
      });
    }

    const { phone, password } = validation.data;

    // Find user and include sensitive fields if needed or handle logic
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "No account found with this phone number." 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Incorrect password. Please try again." 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: "Your phone number is not verified. Please verify your OTP to login.",
        isVerified: false
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error("Login Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    // Check for common connection issues
    if (error.name === 'MongooseServerSelectionError' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: "Database connection timed out. Please ensure your IP is whitelisted in MongoDB Atlas or check your network."
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "An internal server error occurred during login. Please try again later." 
    });
  }
};

/**
 * Refresh Access Token
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, authConfig.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

/**
 * Logout User
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Invalidate the refresh token in Redis (if needed) or just clear from DB
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
