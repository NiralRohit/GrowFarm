const mongoose = require('mongoose');
const User = require('./models/User.model');

const MONGO_URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm";

async function findDemoUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ role: 'admin' });
    const expert = await User.findOne({ role: 'expert' });
    const govt = await User.findOne({ role: 'govt' });
    const trader = await User.findOne({ role: 'trader' });

    console.log("Admin:", admin ? admin.phone : "Not found");
    console.log("Expert:", expert ? expert.phone : "Not found");
    console.log("Govt:", govt ? govt.phone : "Not found");
    console.log("Trader:", trader ? trader.phone : "Not found");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findDemoUsers();
