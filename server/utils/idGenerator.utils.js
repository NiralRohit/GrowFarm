const fs = require('fs');
const path = require('path');

// Load district prefix mapping
const districtPath = path.join(__dirname, '..', 'districtandid.json');
const rawData = fs.readFileSync(districtPath);
const districts = JSON.parse(rawData);

/**
 * Generates a unique farmerId based on district prefix and sequence
 * @param {string} districtName - User's district
 * @param {string|number} count - Total users from this district (or similar sequence)
 */
const generateFarmerId = (districtName, count = 1) => {
  const districtObj = districts.find(d => d.District.toLowerCase() === districtName.toLowerCase());
  
  if (!districtObj) {
    throw new Error(`Invalid district: ${districtName}`);
  }
  
  const prefix = districtObj.id; // e.g. "IN.GU.AB"
  const sequence = String(count).padStart(6, '0');
  
  // Format: IN.GU.AB-000001
  return `${prefix}-${sequence}`;
};

/**
 * Function to validate if a district exists in our JSON
 * @param {string} districtName 
 */
const validateDistrict = (districtName) => {
  return districts.some(d => d.District.toLowerCase() === districtName.toLowerCase());
};

module.exports = {
  generateFarmerId,
  validateDistrict
};
