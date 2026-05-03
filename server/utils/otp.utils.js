const otpGenerator = require('otp-generator');
// Twilio is already in package.json
// const twilio = require('twilio');

/**
 * Generates a 6-digit numeric OTP
 */
const generateOtp = () => {
  return otpGenerator.generate(6, { 
    upperCaseAlphabets: false, 
    specialChars: false, 
    lowerCaseAlphabets: false 
  });
};

/**
 * Sends OTP via Twilio (mocked for now)
 * @param {string} phone - User's phone number
 * @param {string} otp - Generated OTP
 */
const sendOtp = async (phone, otp) => {
  // In a real environment, you'd use Twilio here:
  // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body: `Your GrowFarm OTP is: ${otp}`, from: process.env.TWILIO_PHONE, to: phone });
  
  console.log(`[GrowFarm SMS Mock] Sending to ${phone}: Your OTP is ${otp}`);
  
  return true;
};

module.exports = {
  generateOtp,
  sendOtp
};
