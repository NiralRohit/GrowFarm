const User = require('../models/User.model');
const Profile = require('../models/Profile.model');

/**
 * Get list of all experts (for farmers to consult)
 */
exports.getAllExperts = async (req, res) => {
  try {
    const experts = await User.find({ role: 'expert' }, 'fullName email phone district status picture');
    res.status(200).json(experts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get expert's own profile / dashboard stats
 */
exports.getExpertDashboard = async (req, res) => {
  try {
    const expert = await User.findById(req.user._id);
    if (!expert || expert.role !== 'expert') {
      return res.status(403).json({ message: 'Access denied. Expert only.' });
    }

    // Count farmers in the same district
    const farmersInDistrict = await User.countDocuments({ 
      role: 'farmer', 
      district: expert.district 
    });

    res.status(200).json({
      expert,
      stats: {
        farmersInDistrict,
        district: expert.district,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get farmers assigned to expert's district
 */
exports.getDistrictFarmers = async (req, res) => {
  try {
    const expert = req.user;
    const farmers = await User.find(
      { role: 'farmer', district: expert.district },
      'fullName phone farmerId district'
    );
    
    const farmerIds = farmers.map(f => f._id);
    const profiles = await Profile.find({ user: { $in: farmerIds } }, 
      'user fullName cropsGrown farmSize address completionPercentage');
    
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user.toString()] = p; });
    
    const result = farmers.map(f => ({
      ...f.toJSON(),
      profile: profileMap[f._id.toString()] || null
    }));
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
