const mongoose = require('mongoose');
const User = require('./models/User.model');
const Profile = require('./models/Profile.model');
require('./config/mongoose');

async function renameJohnDoe() {
    try {
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => mongoose.connection.once('open', resolve));
        }

        const indianNames = ['Rajesh Patel', 'Nitin Sharma', 'Amit Shah', 'Suresh Kumar', 'Vijay Jadav'];
        
        // Find all users/profiles with "vraj patel" (case insensitive)
        const users = await User.find({ fullName: /vraj patel/i });
        console.log(`Found ${users.length} users with name including "vraj patel"`);

        for (let i = 0; i < users.length; i++) {
            const newName = indianNames[i % indianNames.length];
            const oldName = users[i].fullName;
            users[i].fullName = newName;
            await users[i].save();
            console.log(`Updated User: ${oldName} -> ${newName}`);
        }

        const profiles = await Profile.find({ fullName: /vraj patel/i });
        console.log(`Found ${profiles.length} profiles with name including "vraj patel"`);

        for (let i = 0; i < profiles.length; i++) {
            const newName = indianNames[i % indianNames.length];
            const oldName = profiles[i].fullName;
            profiles[i].fullName = newName;
            await profiles[i].save();
            console.log(`Updated Profile: ${oldName} -> ${newName}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

renameJohnDoe();
