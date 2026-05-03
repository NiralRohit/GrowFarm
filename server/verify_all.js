const mongoose = require('mongoose');
const User = require('./models/User.model');
const db = require('./config/mongoose');

async function verifyAll() {
  try {
    const res = await User.updateMany({}, { isVerified: true });
    console.log(`Updated ${res.modifiedCount} users to verified status.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyAll();
