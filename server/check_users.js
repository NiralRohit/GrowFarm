const mongoose = require('mongoose');
const User = require('./models/User.model');
const db = require('./config/mongoose');

async function checkUsers() {
    try {
        // Wait for connection
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => mongoose.connection.once('open', resolve));
        }

        const count = await User.countDocuments();
        console.log(`Total users in database: ${count}`);
        
        if (count > 0) {
            const users = await User.find().limit(5).select('phone role isVerified');
            console.log("Sample Users:");
            users.forEach(u => console.log(` - Phone: ${u.phone}, Role: ${u.role}, Verified: ${u.isVerified}`));
        } else {
            console.log("No users found. Login will fail until a user is registered.");
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Error checking users:", err);
        process.exit(1);
    }
}

checkUsers();
