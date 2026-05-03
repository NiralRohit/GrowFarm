const InsurancePolicy = require('../models/InsurancePolicy.model');

/**
 * Get farmer's insurance policies
 */
exports.getPolicies = async (req, res) => {
  try {
    const policies = await InsurancePolicy.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get insurance summary
 */
exports.getSummary = async (req, res) => {
  try {
    const policies = await InsurancePolicy.find({ user: req.user._id });
    
    const active = policies.filter(p => p.status === 'active');
    const claimed = policies.filter(p => p.status === 'claimed');
    const totalCoverage = active.reduce((sum, p) => sum + (p.coverageAmount || 0), 0);
    const totalPremium = policies.reduce((sum, p) => sum + (p.farmerPremium || 0), 0);
    
    res.status(200).json({
      totalPolicies: policies.length,
      activePolicies: active.length,
      claimedPolicies: claimed.length,
      totalCoverage,
      totalPremiumPaid: totalPremium
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Apply for insurance (simplified)
 */
exports.applyInsurance = async (req, res) => {
  try {
    const { policyName, provider, schemeName, cropsCovered, season, 
            coverageAmount, premiumAmount, subsidyPercentage, landArea, surveyNo } = req.body;
    
    const policyNumber = 'INS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const farmerPremium = premiumAmount * (1 - (subsidyPercentage || 0) / 100);
    
    const policy = new InsurancePolicy({
      user: req.user._id,
      policyNumber,
      policyName,
      provider,
      schemeName,
      cropsCovered: cropsCovered || [],
      season,
      coverageAmount,
      premiumAmount,
      subsidyPercentage,
      farmerPremium,
      landArea,
      surveyNo,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'active'
    });
    
    await policy.save();
    res.status(201).json({ message: 'Insurance policy created successfully', policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
