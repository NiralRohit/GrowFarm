const mongoose = require('mongoose');

// Cloud MongoDB Atlas URI (Verified credentials: Niral@@@)
const URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm?retryWrites=true&w=majority&appName=Cluster0";

// Suppress Mongoose 7 deprecation warning
mongoose.set('strictQuery', false);

console.log("Connecting to MongoDB Atlas...");

mongoose.connect(URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
.then(() => {
    console.log("✅ SUCCESS: Database connected successfully to Atlas Cluster0.");
})
.catch((err) => {
    console.error("❌ ERROR: Could not connect to MongoDB Atlas.");
    console.error(`Reason: ${err.message}`);
    console.log("TIP: Check if your IP is whitelisted in MongoDB Atlas Network Access.");
});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('⚠️ MongoDB runtime error:', err);
});

db.once('open', function() {
    console.log("🔌 Active connection established.");
});

module.exports = db;
