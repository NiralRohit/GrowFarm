const db = require('./config/mongoose');

console.log("Waiting for connection result...");

// The mongoose.js file already has the connection logic and logging.
// We just need to wait a bit to see the output.
setTimeout(() => {
    if (db.readyState === 1) {
        console.log("SUCCESS: Database is CONNECTED.");
        process.exit(0);
    } else {
        console.log(`CURRENT STATUS: ${['disconnected', 'connected', 'connecting', 'disconnecting'][db.readyState]}`);
        console.log("If it stays 'connecting', then the connection is being blocked (likely IP whitelist).");
        // We give it more time if it's still connecting
        if (db.readyState === 2) {
             setTimeout(() => {
                 console.log("TIMED OUT: Still connecting after additional wait.");
                 process.exit(1);
             }, 5000);
        } else {
            process.exit(1);
        }
    }
}, 6000);
