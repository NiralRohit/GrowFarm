const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/growfarm');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async function () {
    console.log('Connected to MongoDB');

    try {
        // Read the CSV file
        const csvPath = path.join(__dirname, '..', 'ML FAST API', 'Data', 'GUJARAT.csv');
        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.split('\n');

        // Parse the header
        const header = lines[0].split(',');
        console.log('Header:', header);

        // Build documents - aggregate by District, Crop, Year (sum across seasons)
        const aggregated = {};

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',');
            const districtRaw = cols[1] ? cols[1].trim() : '';
            const year = parseInt(cols[2]);
            const crop = cols[4] ? cols[4].trim() : '';
            const area = parseFloat(cols[5]) || 0;
            const production = parseFloat(cols[6]) || 0;

            if (!districtRaw || !crop || isNaN(year)) continue;

            // Normalize district names to match what the frontend expects
            // The CSV has names like "KACHCHH", "BANAS KANTHA", etc.
            // The frontend dropdown has "Kachchh", "Banaskantha", etc.
            let district = districtRaw;
            // Title case
            district = district.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            // Fix known mappings
            const districtMap = {
                'Ahmadabad': 'Ahmedabad',
                'Banas Kantha': 'Banaskantha',
                'Sabar Kantha': 'Sabarkantha',
                'Panch Mahals': 'Panchmahal',
                'Dohad': 'Dahod',
                'The Dangs': 'Dang',
            };
            if (districtMap[district]) district = districtMap[district];

            const key = `${district}|${crop}|${year}`;
            if (!aggregated[key]) {
                aggregated[key] = { District: district, Crop: crop, Year: year, Area: 0, Prod: 0 };
            }
            aggregated[key].Area += area;
            aggregated[key].Prod += production;
        }

        // Calculate Yield = Production / Area
        const documents = Object.values(aggregated).map(doc => {
            doc.Yield = doc.Area > 0 ? Math.round((doc.Prod / doc.Area) * 100) / 100 : 0;
            doc.Area = Math.round(doc.Area);
            doc.Prod = Math.round(doc.Prod);
            return doc;
        });

        console.log(`Prepared ${documents.length} documents to insert`);
        console.log('Sample:', documents.slice(0, 3));

        // Clear existing data and insert
        const collection = db.collection('apydatas');
        await collection.deleteMany({});
        const result = await collection.insertMany(documents);
        console.log(`Successfully inserted ${result.insertedCount} documents`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
});
