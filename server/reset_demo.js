const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.model');

const MONGO_URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm";

async function resetPasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('123456', salt);

    // Reset Expert
    const expert = await User.findOneAndUpdate(
      { role: 'expert' }, 
      { password: hashedPass, isVerified: true }, 
      { new: true }
    );
    if (expert) {
      console.log(`Expert reset: Phone ${expert.phone}, Pass 123456`);
    } else {
      console.log("No Expert found to reset. Creating one...");
      await User.create({
        phone: '3333333333',
        password: '123456', // Pre-save hook will hash it
        role: 'expert',
        fullName: 'Demo Expert',
        isVerified: true
      });
      console.log("Expert created: Phone 3333333333, Pass 123456");
    }

    // Reset Admin
    const admin = await User.findOneAndUpdate(
      { role: 'admin' }, 
      { password: hashedPass, isVerified: true }, 
      { new: true }
    );
    if (admin) {
      console.log(`Admin reset: Phone ${admin.phone}, Pass 123456`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPasswords();
