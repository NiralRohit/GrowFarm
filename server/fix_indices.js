const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm?retryWrites=true&w=majority&appName=Cluster0";

async function fixIndices() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const collection = mongoose.connection.collection('users');
    
    console.log('Fetching current indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // List of indexes to drop and recreate (as sparse)
    const toDrop = ['farmerId_1', 'aadhaarNumber_1', 'email_1'];

    for (const indexName of toDrop) {
        if (indexes.some(idx => idx.name === indexName)) {
            console.log(`Dropping index: ${indexName}...`);
            await collection.dropIndex(indexName);
            console.log(`Dropped ${indexName}`);
        } else {
            console.log(`Index ${indexName} not found, skipping.`);
        }
    }

    console.log('Indices dropped. Mongoose will recreate them with sparse: true on next server restart.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing indices:', err);
    process.exit(1);
  }
}

fixIndices();
