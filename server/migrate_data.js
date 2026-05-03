const { MongoClient } = require('mongodb');

// Current credentials from your server config
const LOCAL_URI = "mongodb://localhost:27017";
const ATLAS_URI = "mongodb+srv://GrowFarm:Niral123@cluster0.w9mmba4.mongodb.net/growfarm?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "growfarm";

async function migrate() {
    const localClient = new MongoClient(LOCAL_URI);
    const atlasClient = new MongoClient(ATLAS_URI);

    try {
        console.log("Connecting to local and cloud databases... ⏳");
        await localClient.connect();
        await atlasClient.connect();

        const localDb = localClient.db(DB_NAME);
        const atlasDb = atlasClient.db(DB_NAME);

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const colInfo of collections) {
            const colName = colInfo.name;
            console.log(`Moving collection: ${colName}...`);

            const data = await localDb.collection(colName).find({}).toArray();
            if (data.length > 0) {
                // Drop if exists (optional, safely overwrite)
                await atlasDb.collection(colName).deleteMany({}); 
                await atlasDb.collection(colName).insertMany(data);
                console.log(`✅ ${data.length} records moved for ${colName}`);
            } else {
                console.log(`⚠️  Collection ${colName} is empty, skipping.`);
            }
        }

        console.log("\nMigration completed successfully! 🚀");

    } catch (err) {
        console.error("\nMigration failed: ❌", err.message);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();
