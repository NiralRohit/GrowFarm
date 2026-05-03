const mongoose = require('mongoose');
const User = require('./models/User.model');
const Profile = require('./models/Profile.model');

const MONGO_URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm";

async function listAllNames() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({}, 'fullName role phone');
    console.log("--- USERS ---");
    users.forEach(u => console.log(`[${u.role}] ${u.fullName} (${u.phone})`));

    const profiles = await Profile.find({}, 'fullName');
    console.log("--- PROFILES ---");
    profiles.forEach(p => console.log(p.fullName));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listAllNames();
