const mongoose = require('mongoose');
const User = require('./models/User.model');
const Profile = require('./models/Profile.model');
require('./config/mongoose');

async function listAllNames() {
    try {
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => mongoose.connection.once('open', resolve));
        }

        const profiles = await Profile.find().select('fullName user');
        console.log("Profile Names:");
        profiles.forEach(p => console.log(` - ID: ${p.user}, Name: ${p.fullName}`));

        const users = await User.find().select('fullName role');
        console.log("\nUser Names:");
        users.forEach(u => console.log(` - ID: ${u._id}, Name: ${u.fullName}, Role: ${u.role}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAllNames();
