const Profile = require('../models/Profile.model');
const User = require('../models/User.model');
const { calculateCompletion, lookupFarmInfoByAadhaar } = require('../utils/profile.utils');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Storage Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user._id}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images (jpg/png) and PDFs are allowed'));
  }
});

exports.uploadMiddleware = upload.fields([
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'rorDoc', maxCount: 1 },
  { name: 'passbookDoc', maxCount: 1 }
]);

/**
 * GET /api/profile
 * Get current user profile (autocreate if missing for farmers)
 */
exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate('user', 'phone role farmerId aadhaarNumber');
    
    if (!profile) {
      // Auto-create profile if missing for any role
      profile = new Profile({
        user: req.user._id,
        farmerId: req.user.farmerId,
        completionPercentage: 0
      });
      
      // For farmers, try to fetch initial land records from Aadhaar mock data
      if (req.user.role === 'farmer' && req.user.aadhaarNumber) {
        profile.landRecords = lookupFarmInfoByAadhaar(req.user.aadhaarNumber);
      }
      
      profile.completionPercentage = calculateCompletion(profile);
      await profile.save();
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this user role." });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/profile
 * Update profile details
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      fullName, fatherName, dateOfBirth, gender, category, physicalHandicap, qualification,
      rationCardCategory, rationCardNumber, address, bankDetails, interestInContractFarming,
      landRecords, farmSize, cropsGrown
    } = req.body;
    
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Update fields conditionally
    if (fullName !== undefined) profile.fullName = fullName;
    if (fatherName !== undefined) profile.fatherName = fatherName;
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (category !== undefined) profile.category = category;
    if (physicalHandicap !== undefined) profile.physicalHandicap = physicalHandicap;
    if (qualification !== undefined) profile.qualification = qualification;
    if (rationCardCategory !== undefined) profile.rationCardCategory = rationCardCategory;
    if (rationCardNumber !== undefined) profile.rationCardNumber = rationCardNumber;
    if (address !== undefined) profile.address = address;
    if (interestInContractFarming !== undefined) profile.interestInContractFarming = interestInContractFarming;
    if (bankDetails !== undefined) profile.bankDetails = bankDetails;
    if (landRecords !== undefined) profile.landRecords = landRecords;
    if (farmSize !== undefined) profile.farmSize = farmSize;
    if (cropsGrown !== undefined) profile.cropsGrown = cropsGrown;

    // Recalculate completion
    profile.completionPercentage = calculateCompletion(profile);
    
    await profile.save();
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/profile/upload
 * Handle document uploads
 */
exports.uploadDocuments = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const files = req.files;
    const documentUpdates = [];

    if (files.aadhaarDoc) {
      documentUpdates.push({ type: 'Aadhaar', url: `/uploads/profiles/${files.aadhaarDoc[0].filename}` });
    }
    if (files.rorDoc) {
      documentUpdates.push({ type: 'ROR', url: `/uploads/profiles/${files.rorDoc[0].filename}` });
    }
    if (files.passbookDoc) {
      documentUpdates.push({ type: 'BankPassbook', url: `/uploads/profiles/${files.passbookDoc[0].filename}` });
    }

    // Add new documents to array (matching type replaces old one if needed, or just push)
    documentUpdates.forEach(newDoc => {
      const existingIdx = profile.documents.findIndex(d => d.type === newDoc.type);
      if (existingIdx > -1) {
        profile.documents[existingIdx].url = newDoc.url;
        profile.documents[existingIdx].uploadedAt = Date.now();
      } else {
        profile.documents.push(newDoc);
      }
    });

    profile.completionPercentage = calculateCompletion(profile);
    await profile.save();

    res.status(200).json({ 
      message: "Documents uploaded successfully", 
      documents: profile.documents,
      completionPercentage: profile.completionPercentage 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/profile/verify-aadhaar
 * Verify Aadhaar and fetch Land Records (ROR)
 */
exports.verifyAadhaar = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber || aadhaarNumber.length < 12) {
      return res.status(400).json({ message: "Invalid Aadhaar Number" });
    }

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Lookup records from mock utility
    const landRecords = lookupFarmInfoByAadhaar(aadhaarNumber);
    
    if (landRecords && landRecords.length > 0) {
      profile.landRecords = landRecords;
      profile.completionPercentage = calculateCompletion(profile);
      await profile.save();
      return res.status(200).json({ 
        message: "Aadhaar verified and land records updated! 🌍", 
        landRecords 
      });
    } else {
      return res.status(404).json({ message: "No land records found for this Aadhaar Number." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
