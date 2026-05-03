const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/growfarm');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async function () {
    console.log('Connected to MongoDB');

    try {
        const collection = db.collection('districts');

        // Gujarat Districts with their Talukas and Villages
        const gujaratData = {
            "Ahmedabad": {
                "Ahmedabad City": ["Ahmedabad", "Maninagar", "Nikol", "Naroda", "Odhav", "Vastral", "Amraiwadi"],
                "Daskroi": ["Bopal", "Ghuma", "Sarkhej", "Sanand", "Bavla"],
                "Sanand": ["Sanand", "Nal", "Godhavi", "Manipur"],
                "Viramgam": ["Viramgam", "Limbad", "Kalyanpur", "Bhavda", "Mandal"],
                "Mandal": ["Mandal", "Ughroj", "Varmor", "Ranpur"],
                "Detroj-Rampura": ["Detroj", "Rampura", "Detrol"],
                "Dholka": ["Dholka", "Bavla", "Koth"],
                "Dhandhuka": ["Dhandhuka", "Ranpur", "Barwala"],
                "Bavla": ["Bavla", "Jetalpur", "Shilaj"]
            },
            "Amreli": {
                "Amreli": ["Amreli", "Bagsara", "Chalala", "Dudhala"],
                "Babra": ["Babra", "Kunkavav", "Ashkaran"],
                "Dhari": ["Dhari", "Gariyadhar", "Rajula"],
                "Jafrabad": ["Jafrabad", "Mahuva"],
                "Khambha": ["Khambha", "Bagasara"],
                "Lathi": ["Lathi", "Liliya"],
                "Lilia": ["Lilia", "Savarkundla"],
                "Rajula": ["Rajula", "Pipavav"],
                "Savarkundla": ["Savarkundla", "Palitana"]
            },
            "Anand": {
                "Anand": ["Anand", "Vallabh Vidyanagar", "Karamsad", "Bakrol"],
                "Borsad": ["Borsad", "Adas", "Amod"],
                "Khambhat": ["Khambhat", "Thasra", "Khanpur"],
                "Petlad": ["Petlad", "Nadiad", "Sojitra"],
                "Sojitra": ["Sojitra", "Nar"],
                "Tarapur": ["Tarapur", "Dakor"],
                "Umreth": ["Umreth", "Mahudha"]
            },
            "Banaskantha": {
                "Amirgadh": ["Amirgadh", "Khedbrahma"],
                "Danta": ["Danta", "Ambaji"],
                "Dantiwada": ["Dantiwada"],
                "Deesa": ["Deesa", "Bhabhar"],
                "Dhanera": ["Dhanera", "Tharad"],
                "Diyodar": ["Diyodar"],
                "Kankrej": ["Kankrej", "Radhanpur"],
                "Palanpur": ["Palanpur", "Mehsana"],
                "Tharad": ["Tharad"],
                "Vadgam": ["Vadgam"]
            },
            "Bharuch": {
                "Bharuch": ["Bharuch", "Dahej", "Ankleshwar"],
                "Ankleshwar": ["Ankleshwar", "Panoli"],
                "Amod": ["Amod"],
                "Hansot": ["Hansot"],
                "Jambusar": ["Jambusar", "Kavi"],
                "Jhagadia": ["Jhagadia", "Netrang"],
                "Vagra": ["Vagra"],
                "Valia": ["Valia"]
            },
            "Bhavnagar": {
                "Bhavnagar": ["Bhavnagar", "Sihor"],
                "Gariadhar": ["Gariadhar"],
                "Ghogha": ["Ghogha", "Talaja"],
                "Mahuva": ["Mahuva"],
                "Palitana": ["Palitana", "Songadh"],
                "Sihor": ["Sihor"],
                "Talaja": ["Talaja"],
                "Umrala": ["Umrala"],
                "Vallabhipur": ["Vallabhipur"]
            },
            "Dahod": {
                "Dahod": ["Dahod", "Jhalod"],
                "Devgadh Baria": ["Devgadh Baria"],
                "Fatepura": ["Fatepura"],
                "Garbada": ["Garbada"],
                "Jhalod": ["Jhalod"],
                "Limkheda": ["Limkheda"],
                "Sanjeli": ["Sanjeli"]
            },
            "Gandhinagar": {
                "Dehgam": ["Dehgam", "Bardoli", "Kanipur", "Bariya"],
                "Gandhinagar": ["Gandhinagar", "Pethapur", "Adalaj"],
                "Kalol": ["Kalol", "Kadi"],
                "Mansa": ["Mansa"]
            },
            "Jamnagar": {
                "Dhrol": ["Dhrol"],
                "Jamjodhpur": ["Jamjodhpur"],
                "Jamnagar": ["Jamnagar", "Sikka"],
                "Jodia": ["Jodia"],
                "Kalavad": ["Kalavad"],
                "Lalpur": ["Lalpur"]
            },
            "Junagadh": {
                "Bhesan": ["Bhesan"],
                "Junagadh": ["Junagadh", "Girnar"],
                "Keshod": ["Keshod"],
                "Malia Hatina": ["Malia"],
                "Manavadar": ["Manavadar"],
                "Mangrol": ["Mangrol"],
                "Mendarda": ["Mendarda"],
                "Vanthali": ["Vanthali"],
                "Visavadar": ["Visavadar"]
            },
            "Kachchh": {
                "Abdasa": ["Abdasa", "Naliya"],
                "Anjar": ["Anjar"],
                "Bhachau": ["Bhachau"],
                "Bhuj": ["Bhuj", "Madhapar"],
                "Gandhidham": ["Gandhidham", "Adipur"],
                "Lakhpat": ["Lakhpat"],
                "Mandvi": ["Mandvi"],
                "Mundra": ["Mundra"],
                "Nakhatrana": ["Nakhatrana"],
                "Rapar": ["Rapar"]
            },
            "Kheda": {
                "Kapadwanj": ["Kapadwanj", "Ambaliyara", "Garod"],
                "Kathlal": ["Kathlal"],
                "Kheda": ["Kheda"],
                "Mahudha": ["Mahudha"],
                "Matar": ["Matar"],
                "Nadiad": ["Nadiad", "Uttarsanda"],
                "Thasra": ["Thasra"]
            },
            "Mahesana": {
                "Becharaji": ["Becharaji"],
                "Kadi": ["Kadi", "Karannagar"],
                "Mahesana": ["Mahesana"],
                "Unjha": ["Unjha"],
                "Vadnagar": ["Vadnagar"],
                "Vijapur": ["Vijapur"],
                "Visnagar": ["Visnagar"]
            },
            "Narmada": {
                "Dediapada": ["Dediapada"],
                "Garudeshwar": ["Garudeshwar"],
                "Nandod": ["Rajpipla", "Nandod"],
                "Sagbara": ["Sagbara"],
                "Tilakwada": ["Tilakwada"]
            },
            "Navsari": {
                "Chikhli": ["Chikhli"],
                "Gandevi": ["Gandevi"],
                "Jalalpore": ["Jalalpore"],
                "Khergam": ["Khergam"],
                "Navsari": ["Navsari", "Bilimora"]
            },
            "Panchmahal": {
                "Godhra": ["Godhra"],
                "Halol": ["Halol", "Pavagadh"],
                "Jambughoda": ["Jambughoda"],
                "Kalol": ["Kalol"],
                "Morwa Hadaf": ["Morwa"],
                "Shahera": ["Shahera"]
            },
            "Patan": {
                "Chanasma": ["Chanasma"],
                "Harij": ["Harij"],
                "Patan": ["Patan"],
                "Radhanpur": ["Radhanpur", "Shahpur", "Dehgam"],
                "Santalpur": ["Santalpur"],
                "Sami": ["Sami"],
                "Sidhpur": ["Sidhpur"]
            },
            "Porbandar": {
                "Kutiyana": ["Kutiyana", "Mandva"],
                "Porbandar": ["Porbandar"],
                "Ranavav": ["Ranavav", "Bordi"]
            },
            "Rajkot": {
                "Dhoraji": ["Dhoraji", "Pipaliya"],
                "Gondal": ["Gondal", "Ambardi"],
                "Jasdan": ["Jasdan"],
                "Jetpur": ["Jetpur"],
                "Kotda Sangani": ["Kotda Sangani"],
                "Lodhika": ["Lodhika"],
                "Morbi": ["Morbi", "Wankaner"],
                "Paddhari": ["Paddhari"],
                "Rajkot": ["Rajkot"],
                "Upleta": ["Upleta"],
                "Wankaner": ["Wankaner"]
            },
            "Sabarkantha": {
                "Bayad": ["Bayad"],
                "Bhiloda": ["Bhiloda"],
                "Himmatnagar": ["Himmatnagar"],
                "Idar": ["Idar", "Golvada"],
                "Khedbrahma": ["Khedbrahma"],
                "Modasa": ["Modasa"],
                "Prantij": ["Prantij"],
                "Talod": ["Talod"],
                "Vadali": ["Vadali", "Mahor"],
                "Vijaynagar": ["Vijaynagar"]
            },
            "Surat": {
                "Bardoli": ["Bardoli"],
                "Choryasi": ["Surat", "Udhna", "Palsana"],
                "Kamrej": ["Kamrej"],
                "Mandvi": ["Mandvi"],
                "Mangrol": ["Mangrol"],
                "Mahuva": ["Mahuva"],
                "Olpad": ["Olpad"],
                "Palsana": ["Palsana"],
                "Umarpada": ["Umarpada"]
            },
            "Surendranagar": {
                "Chotila": ["Chotila", "Hirana"],
                "Dasada": ["Dasada"],
                "Dhrangadhra": ["Dhrangadhra"],
                "Halvad": ["Halvad"],
                "Limbdi": ["Limbdi", "Aanandpar"],
                "Lakhtar": ["Lakhtar"],
                "Muli": ["Muli"],
                "Sayla": ["Sayla"],
                "Wadhwan": ["Wadhwan", "Surendranagar"]
            },
            "Tapi": {
                "Dolvan": ["Dolvan"],
                "Kukarmunda": ["Kukarmunda"],
                "Nizar": ["Nizar"],
                "Songadh": ["Songadh"],
                "Uchhal": ["Uchhal"],
                "Valod": ["Valod"],
                "Vyara": ["Vyara"]
            },
            "The Dangs": {
                "Ahwa": ["Ahwa"],
                "Subir": ["Subir"],
                "Waghai": ["Waghai"]
            },
            "Vadodara": {
                "Dabhoi": ["Dabhoi"],
                "Karjan": ["Karjan"],
                "Padra": ["Padra"],
                "Savli": ["Savli"],
                "Shinor": ["Shinor"],
                "Vadodara": ["Vadodara", "Alkapuri", "Fatehgunj"],
                "Waghodia": ["Waghodia"]
            },
            "Valsad": {
                "Dharampur": ["Dharampur"],
                "Kaprada": ["Kaprada"],
                "Pardi": ["Pardi"],
                "Umbergaon": ["Umbergaon"],
                "Valsad": ["Valsad", "Vapi"],
                "Vapi": ["Vapi", "Daman"]
            }
        };

        // Build documents
        const documents = [];
        for (const [district, talukas] of Object.entries(gujaratData)) {
            for (const [taluka, villages] of Object.entries(talukas)) {
                for (const village of villages) {
                    documents.push({ District: district, Taluka: taluka, Village: village });
                }
            }
        }

        console.log(`Prepared ${documents.length} district-taluka-village records`);

        // Clear existing and insert
        await collection.deleteMany({});
        const result = await collection.insertMany(documents);
        console.log(`Successfully inserted ${result.insertedCount} records`);

        // Verify
        const districts = await collection.distinct('District');
        console.log(`\nTotal districts: ${districts.length}`);
        console.log('Districts:', districts.sort().join(', '));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    }
});
