const fs = require('fs');
const path = require('path');

/**
 * Calculates profile completion percentage based on field presence
 * @param {Object} profile - Profile object
 */
const calculateCompletion = (profile) => {
  let score = 0;
  const weights = {
    personal: 25, // Name, DOB, Gender
    bank: 20,     // Account, IFSC, Bank Name
    land: 30,     // Land record entries
    documents: 25 // Aadhaar, ROR, etc.
  };

  // Personal (8.33% each)
  if (profile.fullName) score += 8.33;
  if (profile.dateOfBirth) score += 8.33;
  if (profile.gender && profile.gender !== 'Pending') score += 8.34;

  // Bank (6.66% each)
  if (profile.bankDetails) {
    if (profile.bankDetails.accountNo) score += 6.66;
    if (profile.bankDetails.ifsc) score += 6.66;
    if (profile.bankDetails.bankName) score += 6.68;
  }

  // Land (Up to 30%)
  if (profile.landRecords && profile.landRecords.length > 0) {
    score += 30;
  }

  // Documents (Up to 25%)
  if (profile.documents && profile.documents.length > 0) {
    score += 25;
  }

  return Math.min(Math.round(score), 100);
};

/**
 * Searches farminfo.json for land records matching an Aadhaar number
 * @param {string} aadhaar 
 */
const lookupFarmInfoByAadhaar = (aadhaar) => {
  try {
    const filePath = path.join(__dirname, '..', 'farminfo.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Find all farms where this Aadhaar is listed in Ownership_Details
    const matchingFarms = data.filter(farm => 
      farm.Ownership_Details.some(owner => String(owner.Adharnum) === String(aadhaar))
    );

    return matchingFarms.map(farm => ({
      surveyNo: farm.Surveynumber,
      areaInAcres: (farm.Hectare * 2.471) + (farm.Are * 0.0247) + (farm.Square_meters * 0.000247),
      village: farm.Village,
      taluka: farm.Taluka,
      district: farm.District,
      soilType: 'Unknown' // Default since farminfo doesn't have exact soil type per record
    }));
  } catch (error) {
    console.error("Error looking up farm info:", error);
    return [];
  }
};

module.exports = {
  calculateCompletion,
  lookupFarmInfoByAadhaar
};
