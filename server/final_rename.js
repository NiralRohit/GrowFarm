const mongoose = require('mongoose');
const User = require('./models/User.model');
const Profile = require('./models/Profile.model');

const MONGO_URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm";

async function renameJohnDoe() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Update Users
    const usersUpdate = await User.updateMany(
      { fullName: /John Doe/i },
      { $set: { fullName: 'vraj patel' } }
    );
    console.log(`Updated ${usersUpdate.modifiedCount} users.`);

    // 2. Update Profiles
    const profilesUpdate = await Profile.updateMany(
      { fullName: /John Doe/i },
      { $set: { fullName: 'vraj patel' } }
    );
    console.log(`Updated ${profilesUpdate.modifiedCount} profiles.`);

    // 3. Search for any other fields that might contain it
    // (Optional: Bills, Loans etc but usually those link by ID)

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

renameJohnDoe();
