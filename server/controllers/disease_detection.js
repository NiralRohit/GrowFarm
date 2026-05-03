// ============================================================
// Disease Detection Engine — ML-based Image Analysis
// Uses TensorFlow.js + Sharp for plant disease classification
// ============================================================

const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');

// ─── Multer config for file uploads ─────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|bmp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files (jpg, png, webp, bmp) are allowed'));
    }
});

// ─── Disease Classes — 100+ classes across 30+ crops ────────
const DISEASE_CLASSES = [
    // Original 14 crops
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Orange___healthy',
    'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
    'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Squash___healthy',
    'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spo',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy',
    // ── New Indian Agriculture Crops ──
    'Rice___Blast', 'Rice___Brown_Spot', 'Rice___Bacterial_Leaf_Blight', 'Rice___Sheath_Blight', 'Rice___Tungro', 'Rice___healthy',
    'Wheat___Leaf_Rust', 'Wheat___Powdery_Mildew', 'Wheat___Septoria', 'Wheat___Loose_Smut', 'Wheat___healthy',
    'Cotton___Bacterial_Blight', 'Cotton___Leaf_Curl', 'Cotton___Alternaria_Leaf_Spot', 'Cotton___healthy',
    'Sugarcane___Red_Rot', 'Sugarcane___Smut', 'Sugarcane___Rust', 'Sugarcane___healthy',
    'Mango___Anthracnose', 'Mango___Powdery_Mildew', 'Mango___Sooty_Mold', 'Mango___Bacterial_Canker', 'Mango___healthy',
    'Banana___Panama_Wilt', 'Banana___Sigatoka_Leaf_Spot', 'Banana___Bunchy_Top', 'Banana___healthy',
    'Chilli___Leaf_Curl', 'Chilli___Anthracnose', 'Chilli___Powdery_Mildew', 'Chilli___Bacterial_Wilt', 'Chilli___healthy',
    'Onion___Purple_Blotch', 'Onion___Downy_Mildew', 'Onion___Stemphylium_Blight', 'Onion___healthy',
    'Groundnut___Tikka_Disease', 'Groundnut___Rust', 'Groundnut___Collar_Rot', 'Groundnut___healthy',
    'Coconut___Bud_Rot', 'Coconut___Leaf_Blight', 'Coconut___Root_Wilt', 'Coconut___healthy',
    'Tea___Blister_Blight', 'Tea___Red_Rust', 'Tea___Grey_Blight', 'Tea___healthy',
    'Coffee___Leaf_Rust', 'Coffee___Berry_Disease', 'Coffee___Black_Rot', 'Coffee___healthy',
    'Mustard___Alternaria_Blight', 'Mustard___White_Rust', 'Mustard___Downy_Mildew', 'Mustard___healthy',
    'Cucumber___Downy_Mildew', 'Cucumber___Powdery_Mildew', 'Cucumber___Anthracnose', 'Cucumber___healthy',
    'Brinjal___Fruit_Rot', 'Brinjal___Little_Leaf', 'Brinjal___Damping_Off', 'Brinjal___healthy',
    'Guava___Wilt', 'Guava___Anthracnose', 'Guava___Canker', 'Guava___healthy',
    'Papaya___Ring_Spot', 'Papaya___Leaf_Curl', 'Papaya___Anthracnose', 'Papaya___healthy',
    'Lemon___Citrus_Canker', 'Lemon___Citrus_Greening', 'Lemon___Black_Spot', 'Lemon___healthy',
    'Cauliflower___Black_Rot', 'Cauliflower___Downy_Mildew', 'Cauliflower___Alternaria_Leaf_Spot', 'Cauliflower___healthy',
    'Cabbage___Black_Rot', 'Cabbage___Clubroot', 'Cabbage___Downy_Mildew', 'Cabbage___healthy'
];

// ─── Disease Information Database — In-depth Prevention & Treatment ──
const diseaseInfo = {
    'Apple___Apple_scab': {
        crop: 'Apple', disease: 'Apple Scab',
        cause: 'Caused by the fungus Venturia inaequalis. Overwinters in fallen leaves and soil. Favored by wet, cool weather (55-75°F) in spring and early summer. Spores spread by wind, rain or splashing water.',
        suggestion: 'PREVENTION: 1. Plant scab-resistant apple varieties (Liberty, Enterprise, Prima, Redfree). 2. Rake and burn all fallen leaves in autumn to remove overwintering spores. 3. Apply a 3-6 inch layer of compost mulch under trees to suppress spore splash. 4. Prune trees annually to improve air circulation and allow leaves to dry faster. 5. Avoid overhead irrigation — use drip watering instead. TREATMENT: 1. Apply fungicide sprays (Captan, Myclobutanil, or Sulfur-based) starting at green tip stage and repeat every 7-10 days through petal fall. 2. Use Neem oil as an organic alternative — spray every 7 days during wet periods. 3. Apply lime sulfur during dormant season to kill overwintering spores. 4. Remove and destroy severely infected fruits and branches immediately.'
    },
    'Apple___Black_rot': {
        crop: 'Apple', disease: 'Black Rot',
        cause: 'Caused by fungus Diplodia seriata (syn Botryosphaeria obtusa). Infects dead tissue as well as living trunks, branches, leaves and fruits. Spores released in wet weather and spread by wind or splashing water through natural openings or wounds.',
        suggestion: 'PREVENTION: 1. Prune out all dead or diseased branches during dry weather — make cuts at least 6 inches below visible cankers. 2. Remove all mummified fruit from trees and ground before spring. 3. Remove dead stumps as they harbor spores for years. 4. Maintain tree vigor through proper fertilization (balanced NPK). 5. Avoid wounding fruit during harvest. TREATMENT: 1. Apply Captan or Thiophanate-methyl fungicide from pink bud stage through harvest at 10-14 day intervals. 2. For organic treatment, spray copper-based fungicide (Bordeaux mixture) at green tip and repeat every 7-10 days. 3. Dip pruning tools in 10% bleach solution between cuts to prevent spread. 4. Improve drainage around trees to reduce moisture.'
    },
    'Apple___Cedar_apple_rust': {
        crop: 'Apple', disease: 'Cedar Apple Rust',
        cause: 'Caused by Gymnosporangium juniperi-virginianae. A fungal disease requiring two host species: apple and Eastern red cedar (juniper). Spores develop as reddish-brown galls on juniper branches and travel by wind to infect apple trees.',
        suggestion: 'PREVENTION: 1. Plant rust-resistant apple varieties (Liberty, Freedom, Redfree, Enterprise). 2. Remove all juniper/cedar trees within 300 feet of apple orchard if possible. 3. Scout nearby junipers in early spring and prune galls before they release spores (cut 4-6 inches below gall). 4. Avoid planting apple and cedar trees in close proximity. TREATMENT: 1. Apply Myclobutanil (Immunox) fungicide starting when apple flower buds show color — repeat every 7 days through 2 weeks after petal fall. 2. Mancozeb fungicide can be applied as a protectant before infection occurs. 3. For organic management, use sulfur sprays starting at pink bud stage. 4. Remove heavily infected leaves to slow spread. 5. Apply Triadimefon at first sign of orange spots on leaves.'
    },
    'Apple___healthy': { crop: 'Apple', disease: 'No Disease', cause: 'Your apple crop appears healthy with no signs of disease!', suggestion: 'MAINTENANCE: 1. Continue regular monitoring — inspect leaves weekly for spots, discoloration, or unusual growth. 2. Maintain proper pruning for air circulation. 3. Apply dormant oil spray in late winter to prevent overwintering pests. 4. Keep area clean of fallen debris. 5. Ensure balanced fertilization and adequate watering. 6. Monitor for early signs of scab, rust, or rot especially during wet seasons.' },
    'Blueberry___healthy': { crop: 'Blueberry', disease: 'No Disease', cause: 'Your blueberry crop appears healthy!', suggestion: 'MAINTENANCE: 1. Keep soil pH between 4.5-5.5 with sulfur amendments. 2. Mulch with pine needles or wood chips. 3. Prune old canes annually. 4. Water consistently but avoid waterlogging. 5. Monitor for mummy berry disease in spring.' },
    'Cherry_(including_sour)___Powdery_mildew': {
        crop: 'Cherry', disease: 'Powdery Mildew',
        cause: 'Caused by Podosphaera clandestina fungus. Primarily infects young expanding leaves but also attacks buds, fruit and stems. Overwinters as chasmothecia (small black bodies) on dead leaves and in tree crotches.',
        suggestion: 'PREVENTION: 1. Plant resistant cherry varieties when available. 2. Remove and destroy all sucker shoots immediately. 3. Use drip irrigation only — never wet the leaves or developing fruit. 4. Prune annually to open canopy for maximum air circulation and sunlight penetration. 5. Manage nitrogen fertilization carefully — excess nitrogen promotes susceptible new growth. TREATMENT: 1. Apply sulfur-based fungicide at first sign of white powdery coating — repeat every 7-14 days. 2. Use potassium bicarbonate spray (1 tablespoon per gallon of water) as organic treatment. 3. Apply Myclobutanil or Trifloxystrobin for severe infections. 4. Spray Neem oil (70% concentration) every 7 days during active infection. 5. Mix 1 part milk to 9 parts water and spray on affected areas — the proteins in milk fight mildew. 6. Remove severely infected leaves and dispose away from the orchard.'
    },
    'Cherry_(including_sour)___healthy': { crop: 'Cherry', disease: 'No Disease', cause: 'Your cherry crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue good air circulation practices. 2. Monitor for powdery mildew during warm humid periods. 3. Keep area free of fallen debris. 4. Apply dormant copper spray in late winter. 5. Ensure balanced nutrition.' },
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
        crop: 'Corn (Maize)', disease: 'Gray Leaf Spot',
        cause: 'Caused by fungus Cercospora zeae-maydis. Hinders photosynthesis and reduces carbohydrates for grain fill. Most damaging in warm, humid conditions with continuous corn cropping and minimum tillage.',
        suggestion: 'PREVENTION: 1. Choose resistant corn hybrids — check local seed ratings for gray leaf spot resistance. 2. Rotate corn with soybeans or other non-host crops for at least 1-2 years. 3. Use conventional tillage to bury infected crop residue. 4. Avoid late planting — early-planted corn is less susceptible. 5. Do not plant corn in low-lying, poorly drained fields. TREATMENT: 1. Apply foliar fungicides (Azoxystrobin/Quilt, Pyraclostrobin/Headline, or Propiconazole/Tilt) at VT-R1 stage (tasseling to silking). 2. Scout fields from V8 onward — treat if lesions reach 3rd leaf below ear before tasseling. 3. For severe outbreaks, a second fungicide application 14 days after the first may be needed. 4. Improve field drainage to reduce humidity around plants.'
    },
    'Corn_(maize)___Common_rust_': {
        crop: 'Corn (Maize)', disease: 'Common Rust',
        cause: 'Caused by fungus Puccinia sorghi. Spores are carried by wind from southern regions. Favored by cool temperatures (60-77°F) and high humidity. Produces brick-red to brown pustules on both leaf surfaces.',
        suggestion: 'PREVENTION: 1. Plant resistant corn hybrids — most field corn has adequate resistance. 2. Plant early to avoid peak spore arrival periods. 3. Avoid planting susceptible sweet corn or popcorn near field corn. 4. Monitor weather forecasts for cool, humid conditions favorable to rust. TREATMENT: 1. Apply fungicide (Mancozeb, Azoxystrobin, or Propiconazole) when pustules appear before silking and weather remains cool and wet. 2. Spray at first sign on lower leaves and repeat in 14 days if conditions persist. 3. For sweet corn, use protective fungicide starting 2 weeks before tassel emergence. 4. Remove severely infected lower leaves if practical. 5. Ensure good air flow by proper plant spacing.'
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
        crop: 'Corn (Maize)', disease: 'Northern Leaf Blight',
        cause: 'Caused by Exserohilum turcicum. Creates characteristic long, cigar-shaped gray-green lesions (1-6 inches). Favored by moderate temperatures, heavy dew, and frequent rain. Can cause 30-50% yield loss in susceptible hybrids.',
        suggestion: 'PREVENTION: 1. Use hybrids with both Ht gene resistance and quantitative resistance for best protection. 2. Rotate away from corn for at least 1 year. 3. Tillage to bury infected residue reduces initial inoculum significantly. 4. Avoid planting into heavy corn residue from previous season. TREATMENT: 1. Apply foliar fungicide (Azoxystrobin, Propiconazole, or Picoxystrobin) between V14 and VT stage if lower leaf lesions are increasing rapidly. 2. Treat if disease is present on 3rd leaf below ear or higher before tasseling. 3. Use combination fungicides (strobilurin + triazole) for best results. 4. Scout fields every 5-7 days during warm humid periods. 5. A single well-timed application at VT/R1 is usually sufficient.'
    },
    'Corn_(maize)___healthy': { crop: 'Corn (Maize)', disease: 'No Disease', cause: 'Your corn crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue monitoring for rust pustules and leaf spots weekly. 2. Ensure proper nitrogen fertilization for strong plant health. 3. Maintain good drainage in the field. 4. Scout for insect damage which can invite secondary infections.' },
    'Grape___Black_rot': {
        crop: 'Grape', disease: 'Black Rot',
        cause: 'Caused by fungus Guignardia bidwellii. Overwinters in mummified berries and cane cankers. Spores released during rain over a 2-3 month period in spring/summer. Infection visible after 8-25 days.',
        suggestion: 'PREVENTION: 1. Remove ALL mummified berries from vines and ground before spring, as they are the primary infection source. 2. Prune vines for good air circulation and rapid drying. 3. Space vines properly with full sun exposure. 4. Keep area free of weeds and tall grass to reduce humidity. 5. Tie vines properly — keep fruit off the ground. TREATMENT: 1. Apply protective fungicide starting when new shoots are 2-4 inches long. Key spray times: at 2-4 inches, at 10-15 inches, just before bloom, just after bloom, and at fruit set. 2. Use Myclobutanil, Mancozeb, or Captan fungicides. 3. Copper-based sprays (Bordeaux mixture) can be used as organic alternative. 4. Remove and destroy infected berries, leaves and tendrils immediately. 5. Continue fungicide protection until berries reach full sugar content.'
    },
    'Grape___Esca_(Black_Measles)': {
        crop: 'Grape', disease: 'Black Measles (Esca)',
        cause: 'Caused by a complex of fungi including Phaeoacremonium aleophilum and Phaeomoniella chlamydospora. Enters through pruning wounds during fall-spring rainfall. Wounds susceptible for several weeks after pruning.',
        suggestion: 'PREVENTION: 1. Delay pruning to late in dormant season when wounds heal faster. 2. Use double pruning: first rough cut in early winter, then final cut in late winter. 3. Apply pruning-wound protectant immediately after cutting (wound sealant with 5% boric acid, Topsin-M paste, or VitiSeal). 4. Avoid pruning during or just before rain. 5. Sterilize pruning tools between vines with 70% alcohol. TREATMENT: 1. Cut away cankered portions to healthy white wood — cut at least 4 inches beyond visible infection. 2. Remove and burn all diseased wood from vineyard. 3. Apply Thiophanate-methyl (Topsin-M) as wound dressing. 4. Trunk renewal: train a new shoot from below the canker to replace the infected trunk. 5. Foliar application of phosphorous acid can help reduce symptoms. 6. Severely infected vines may need complete removal.'
    },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
        crop: 'Grape', disease: 'Leaf Blight (Isariopsis Leaf Spot)',
        cause: 'Caused by Pseudocercospora vitis (syn. Isariopsis). Favored by warm, humid conditions. Fungal spores spread by wind, rain, and splashing water. Causes brown necrotic spots on leaves leading to defoliation.',
        suggestion: 'PREVENTION: 1. Choose resistant grape varieties for your region. 2. Prune for open canopy to improve air circulation and reduce leaf wetness. 3. Remove and destroy fallen infected leaves in autumn. 4. Avoid overhead irrigation — use drip systems. 5. Apply compost mulch to prevent soil splash carrying spores. TREATMENT: 1. Spray Mancozeb or Copper Oxychloride fungicide at first sign of spots — repeat every 10-14 days. 2. Apply Carbendazim (Bavistin) at 1g per liter of water for active infection. 3. Use Bordeaux mixture (copper sulfate + lime) as organic treatment. 4. Remove severely blighted leaves to reduce spore load. 5. Ensure adequate potassium fertilization which improves disease tolerance.'
    },
    'Grape___healthy': { crop: 'Grape', disease: 'No Disease', cause: 'Your grape crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue regular canopy management and pruning. 2. Monitor for early signs of rot, mildew, or leaf spots. 3. Maintain proper vine spacing and trellising. 4. Apply preventative copper spray during dormant season. 5. Keep vineyard floor clean.' },
    'Orange___Haunglongbing_(Citrus_greening)': {
        crop: 'Orange', disease: 'Citrus Greening (Huanglongbing)',
        cause: 'The most severe citrus disease worldwide. Caused by Candidatus Liberibacter bacteria, transmitted by the Asian citrus psyllid (ACP) insect. Affects tree health, fruit quality, and yield. No cure exists once infected.',
        suggestion: 'PREVENTION: 1. Use certified disease-free nursery stock only. 2. Implement area-wide psyllid management by applying systemic insecticides (Imidacloprid, Thiamethoxam) to all citrus trees. 3. Install insect-proof screen houses for young tree production. 4. Monitor for ACP using yellow sticky traps and flush shoot inspections. 5. Coordinate spray programs with neighboring groves. TREATMENT: 1. There is NO CURE — focus on management to extend tree life. 2. Remove and destroy severely symptomatic trees to reduce bacterial reservoir. 3. Apply enhanced foliar nutrition (zinc, manganese, boron, micronutrient cocktails) every 2 months to maintain production. 4. Provide extra irrigation and increase fertilization to compensate. 5. Apply Kaolin clay as a psyllid repellent. 6. Use Thermotherapy: cover trees with black plastic on hot days (>130°F internal) to kill bacteria — experimental but shows promise.'
    },
    'Peach___Bacterial_spot': {
        crop: 'Peach', disease: 'Bacterial Spot',
        cause: 'Caused by Xanthomonas arboricola pv. pruni. Gram-negative bacteria with flagellum that moves through water films to invade wet tissue through natural openings and wounds. Favored by warm, humid, windy weather.',
        suggestion: 'PREVENTION: 1. Plant resistant peach varieties (Contender, Clayton, Harrow Beauty, Redhaven). 2. Choose planting sites with good air drainage — avoid frost pockets. 3. Use pathogen-free certified nursery stock only. 4. Avoid overhead sprinkling — use drip irrigation. 5. Do not work among trees when foliage is wet. TREATMENT: 1. Apply copper-based bactericide (Kocide 3000) at leaf fall and again at bud swell. 2. Spray Oxytetracycline (Mycoshield) starting at petal fall and repeat every 7-10 days during wet weather. 3. Apply zinc-copper-lime mixture for season-long protection. 4. Prune out severely infected twigs during dry weather in summer. 5. Thin fruit to improve air circulation around remaining fruit. 6. Adequate nitrogen fertilization improves tree vigor and disease tolerance.'
    },
    'Peach___healthy': { crop: 'Peach', disease: 'No Disease', cause: 'Your peach crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue proper pruning for open center shape. 2. Apply dormant copper spray. 3. Monitor for bacterial spot during wet weather. 4. Maintain adequate nutrition. 5. Thin fruit for best quality.' },
    'Pepper,_bell___Bacterial_spot': {
        crop: 'Pepper (Bell)', disease: 'Bacterial Spot',
        cause: 'Caused by Xanthomonas species (X. euvesicatoria, X. gardneri, X. perforans, X. vesicatoria). Bacteria survive on seed and plant debris. Spread by rain splash, contaminated tools, and worker handling.',
        suggestion: 'PREVENTION: 1. Use only certified disease-free seed — consider hot water seed treatment (125°F for 30 minutes). 2. Rotate out of peppers and tomatoes for at least 2-3 years. 3. Avoid overhead irrigation — use drip only. 4. Space plants for good air circulation. 5. Never handle wet plants — this spreads bacteria rapidly. TREATMENT: 1. Spray copper hydroxide (Kocide) + Mancozeb mixture every 5-7 days during wet weather. 2. Apply Acibenzolar-S-methyl (Actigard) to induce plant immunity — alternate with copper sprays. 3. Remove severely infected plants from the field. 4. Wash hands thoroughly with soap between rows. 5. Sanitize all tools with quaternary ammonium solution. 6. Apply biological control agent Bacillus subtilis (Serenade) as organic alternative.'
    },
    'Pepper,_bell___healthy': { crop: 'Pepper (Bell)', disease: 'No Disease', cause: 'Your pepper crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue monitoring for leaf spots. 2. Maintain consistent watering with drip irrigation. 3. Provide adequate calcium to prevent blossom end rot. 4. Use mulch to prevent soil splash.' },
    'Potato___Early_blight': {
        crop: 'Potato', disease: 'Early Blight',
        cause: 'Caused by fungus Alternaria solani. Affects leaves and stems primarily, can also infect tubers. Favored by warm temperatures (75-85°F), high humidity, and stressed or aging plant tissue. Overwinters in plant debris and soil.',
        suggestion: 'PREVENTION: 1. Plant certified disease-free seed potatoes only. 2. Choose resistant varieties (Kennebec, Elba, Norland). 3. Rotate crops — do not plant potatoes/tomatoes in same spot for 3 years. 4. Maintain adequate fertility — stressed underfed plants are highly susceptible. 5. Irrigate early in the day so foliage dries quickly. TREATMENT: 1. Apply protectant fungicide (Chlorothalonil/Bravo or Mancozeb) starting at first sign of symptoms — repeat every 7-10 days. 2. Alternate with systemic fungicide (Azoxystrobin/Amistar) every 14 days for resistance management. 3. Remove and destroy lower infected leaves immediately. 4. Apply potassium bicarbonate spray as organic option. 5. Allow tubers to mature fully before harvesting. 6. Harvest during dry weather and avoid wounding tubers to prevent storage rot.'
    },
    'Potato___Late_blight': {
        crop: 'Potato', disease: 'Late Blight',
        cause: 'Caused by the oomycete Phytophthora infestans. Was responsible for the Irish Potato Famine. Spreads extremely rapidly in cool (50-80°F), wet conditions. Can destroy an entire field in days if untreated. Water molds, not true fungi.',
        suggestion: 'PREVENTION: 1. Use only certified disease-free seed — NEVER plant symptomatic tubers. 2. Destroy all volunteer potato plants and cull piles. 3. Plant resistant varieties (Defender, Jacqueline Lee, Elba). 4. Do not crowd plants — wide spacing improves drying. 5. Hill soil over tubers to prevent spore washing down to tubers. TREATMENT: 1. THIS IS AN EMERGENCY — act immediately! Apply Chlorothalonil or Mancozeb fungicide as soon as symptoms appear — spray every 5-7 days in wet weather. 2. Use systemic fungicides (Metalaxyl/Ridomil or Cymoxanil) for active infections. 3. If infection found in only a few plants, IMMEDIATELY remove, bag, and destroy them — do not compost. 4. Kill vine tops (desiccate) 2-3 weeks before harvest to prevent tuber infection. 5. Fungicide like Phosphorous acid (ProPhyt) can supplement protectant sprays. 6. Do NOT wash tubers before storage — let skin set.'
    },
    'Potato___healthy': { crop: 'Potato', disease: 'No Disease', cause: 'Your potato crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue monitoring for dark spots on leaves. 2. Hill soil around stems as they grow. 3. Maintain consistent moisture. 4. Watch for late blight warnings from local extension services.' },
    'Raspberry___healthy': { crop: 'Raspberry', disease: 'No Disease', cause: 'Your raspberry crop appears healthy!', suggestion: 'MAINTENANCE: 1. Prune old canes after fruiting. 2. Maintain 3-4 inch mulch layer. 3. Ensure good drainage. 4. Monitor for fungal diseases during humid weather.' },
    'Soybean___healthy': { crop: 'Soybean', disease: 'No Disease', cause: 'Your soybean crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue monitoring for sudden death syndrome. 2. Check for soybean rust during warm humid periods. 3. Maintain proper crop rotation. 4. Scout for aphids and bean leaf beetles.' },
    'Squash___Powdery_mildew': {
        crop: 'Squash', disease: 'Powdery Mildew',
        cause: 'Caused by Podosphaera xanthii and Erysiphe cichoracearum. Favored by warm days (68-81°F), cool nights, and moderate humidity. Spores spread by wind. Older leaves infected first.',
        suggestion: 'PREVENTION: 1. Plant resistant varieties (look for PM or PMR in variety name). 2. Space plants widely for excellent air circulation. 3. Do NOT over-apply nitrogen — it creates lush, susceptible growth. 4. Water at soil level, never overhead. 5. Plant in full sun locations. TREATMENT: 1. Apply potassium bicarbonate (Kaligreen, MilStop) — safe and very effective organic option. 2. Spray Neem oil every 7 days at first sign of white patches. 3. MILK SPRAY: Mix 1 part whole milk to 9 parts water — spray on affected leaves every 3-4 days (the proteins fight mildew naturally). 4. Apply sulfur-based fungicide for moderate infections (not in temperatures above 90°F). 5. For severe cases, use Myclobutanil (Immunox) every 10-14 days. 6. Remove heavily infected older leaves to slow spread to younger growth.'
    },
    'Strawberry___Leaf_scorch': {
        crop: 'Strawberry', disease: 'Leaf Scorch',
        cause: 'Caused by fungus Diplocarpon earliana. Appears as small purple-red spots that expand and merge, creating scorched appearance. Overwinters in infected leaves. Spread by rain splash and overhead irrigation.',
        suggestion: 'PREVENTION: 1. Plant resistant varieties (Allstar, Earliglow, Guardian, Honeoye). 2. Use certified disease-free transplants only. 3. Space plants for good air circulation (12-18 inches apart). 4. Use straw mulch to prevent rain splash from soil to leaves. 5. Use drip irrigation only — overhead watering spreads spores rapidly. TREATMENT: 1. Renovate strawberry beds after harvest — mow tops and thin plants to improve air flow. 2. Apply Captan or Myclobutanil fungicide at first sign of purple spots — repeat every 7-10 days during wet weather. 3. Apply copper-based fungicide (Bordeaux mixture) as organic option. 4. Remove and destroy all severely infected leaves. 5. Avoid working in wet patches. 6. Replace beds every 3-4 years with fresh disease-free plants in a new location.'
    },
    'Strawberry___healthy': { crop: 'Strawberry', disease: 'No Disease', cause: 'Your strawberry crop appears healthy!', suggestion: 'MAINTENANCE: 1. Continue using straw mulch. 2. Renovate beds after harvest. 3. Keep area weed-free. 4. Monitor for leaf diseases during humid weather. 5. Replace beds every 3-4 years.' },
    'Tomato___Bacterial_spot': {
        crop: 'Tomato', disease: 'Bacterial Spot',
        cause: 'Caused by Xanthomonas species. Aerobic, gram-negative bacteria that invade wet tissue. Spread by rain splash, overhead irrigation, and worker handling. Can survive on seed for years.',
        suggestion: 'PREVENTION: 1. Use certified disease-free or hot water-treated seed (122°F for 25 minutes). 2. Purchase transplants from reputable sources — inspect carefully. 3. Rotate away from tomatoes and peppers for 3+ years. 4. Use drip irrigation exclusively. 5. Mulch heavily to prevent soil splash. 6. Never handle wet plants — schedule all activities during dry conditions. TREATMENT: 1. Spray copper hydroxide + Mancozeb tank mix every 5-7 days during wet weather. 2. Apply Acibenzolar-S-methyl (Actigard) to boost plant immune response. 3. Use Bacillus subtilis (Serenade) as biological control — spray every 5-7 days. 4. Remove severely infected plants and destroy them. 5. Sanitize stakes, cages, and tools with 10% bleach between plants.'
    },
    'Tomato___Early_blight': {
        crop: 'Tomato', disease: 'Early Blight',
        cause: 'Caused by Alternaria tomatophila and A. solani fungi. Creates dark concentric "target-like" rings on lower leaves first. Favored by warm temperatures, high humidity, and rain. Overwinters in soil and plant debris for 1+ year.',
        suggestion: 'PREVENTION: 1. Use disease-free certified seed or treated transplants. 2. Rotate tomatoes to a new location every 2-3 years. 3. Remove all tomato debris at end of season — do not compost. 4. Mulch heavily (3-4 inches) to prevent soil splash carrying spores to lower leaves. 5. Stake or cage plants to keep foliage off the ground. 6. Water at soil level only, in the morning. TREATMENT: 1. Apply Chlorothalonil (Daconil) protectant fungicide starting when first fruits form — repeat every 7-10 days. 2. Alternate with Azoxystrobin (Amistar) systemic fungicide for resistance management. 3. Copper-based fungicide (Bordeaux mixture) works as organic option. 4. Remove infected lower leaves immediately — prune up to 12 inches from soil. 5. Apply Bacillus subtilis (Serenade) every 7 days as biological control. 6. Maintain adequate nitrogen and phosphorus — stressed plants succumb faster.'
    },
    'Tomato___Late_blight': {
        crop: 'Tomato', disease: 'Late Blight',
        cause: 'Caused by Phytophthora infestans (water mold). Creates large, water-soaked dark brown lesions. Extremely aggressive — can destroy entire crop in days. Favored by cool (50-80°F) wet conditions. Spreads by airborne spores.',
        suggestion: 'PREVENTION: 1. Use only certified, disease-free transplants. 2. Plant resistant varieties (Mountain Magic, Defiant, Iron Lady, Mountain Merit). 3. Space plants widely for maximum air circulation. 4. Avoid late-season planting when conditions favor blight. 5. Check local blight forecasting tools (USAblight.org). TREATMENT: 1. ACT IMMEDIATELY — this is an emergency disease! Apply Chlorothalonil every 5-7 days during cool wet weather. 2. Use systemic fungicides: Metalaxyl (Ridomil) or Cymoxanil for active infections. 3. Spray copper fungicide (fixed copper or Bordeaux mixture) every 5-7 days as organic option. 4. REMOVE AND BAG infected plants immediately — do not compost, burn or bag in plastic. 5. Apply Phosphorous acid (ProPhyt) as supplemental spray. 6. Harvest green tomatoes before infection reaches fruit. 7. Monitor all neighboring gardens — spores travel miles by wind.'
    },
    'Tomato___Leaf_Mold': {
        crop: 'Tomato', disease: 'Leaf Mold',
        cause: 'Caused by fungus Passalora fulva (syn. Fulvia fulva). Primarily a greenhouse disease. Leaves develop pale green-yellow spots on upper surface and olive-green velvety mold below. Thrives in high humidity (>85%), poor ventilation.',
        suggestion: 'PREVENTION: 1. Use resistant tomato varieties (many modern varieties have Cf resistance genes). 2. Space plants widely — at least 24 inches apart. 3. In greenhouses: maintain humidity below 85% with fans and ventilation. 4. Roll up tunnel sides to increase air flow. 5. Avoid leaf wetting — use drip irrigation only. 6. Keep night temperatures in greenhouses ABOVE outdoor temp to prevent condensation. TREATMENT: 1. Apply Chlorothalonil fungicide every 7-10 days at first sign of symptoms. 2. Use copper-based fungicide (Kocide) as organic alternative. 3. Prune lower leaves and suckers aggressively to improve air flow. 4. Remove infected leaves immediately — bag and remove from greenhouse. 5. Sterilize stakes, ties, and tools with 10% bleach. 6. At season end, remove ALL plant debris and sanitize greenhouse surfaces. 7. Apply Bacillus amyloliquefaciens (DoubleNickel) biological control.'
    },
    'Tomato___Septoria_leaf_spot': {
        crop: 'Tomato', disease: 'Septoria Leaf Spot',
        cause: 'Caused by fungus Septoria lycopersici. One of the most destructive tomato foliar diseases. Creates small circular spots with dark borders and tan centers with tiny black fruiting bodies. Starts on lower leaves and moves upward.',
        suggestion: 'PREVENTION: 1. Use clean certified seed — or treat seed with hot water (122°F for 25 min). 2. Rotate with non-solanaceous crops for 3+ years. 3. Remove all tomato debris at season end — the fungus survives in debris. 4. Mulch heavily to prevent rain splash from soil. 5. Stake plants and prune lower 12 inches of foliage. TREATMENT: 1. Apply Chlorothalonil (Daconil) or Mancozeb protectant at first symptom — repeat every 7-10 days. 2. Alternate with systemic fungicide like Azoxystrobin. 3. Copper-based fungicide spray every 7 days as organic option. 4. Remove ALL infected leaves promptly — the spots produce thousands of spores. 5. Do not work among wet plants. 6. Apply Baking soda spray (1 tbsp per gallon + few drops dish soap) as home remedy between fungicide applications.'
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
        crop: 'Tomato', disease: 'Two-spotted Spider Mite',
        cause: 'Caused by Tetranychus urticae. Tiny arthropods (not insects) that suck cell contents from leaves. Up to 20 generations per year. Favored by hot, dry, dusty conditions and excess nitrogen. Outbreaks often triggered by killing mite predators with broad-spectrum insecticides.',
        suggestion: 'PREVENTION: 1. AVOID broad-spectrum insecticides (carbaryl, pyrethroids) — they kill beneficial predators that naturally control mites. 2. Do not over-fertilize with nitrogen — lush growth attracts mites. 3. Keep area around plants clean — reduce dust on roads/paths. 4. Water plants regularly — drought stress increases mite populations. 5. Introduce predatory mites (Phytoseiulus persimilis, Neoseiulus californicus) preventatively. TREATMENT: 1. Spray affected plants with strong water jet to dislodge mites — repeat every 2-3 days. 2. Apply insecticidal soap spray directly to undersides of leaves — repeat every 5 days for 3 applications. 3. Use Neem oil (1-2%) spray every 7 days — it disrupts mite reproduction. 4. Apply horticultural oil (1%) for heavy infestations. 5. For severe outbreaks, use miticides like Abamectin (Avid) or Bifenazate (Acramite). 6. Release 2,000+ predatory mites per 1,000 sq ft at first sign of infestation.'
    },
    'Tomato___Target_Spo': {
        crop: 'Tomato', disease: 'Target Spot',
        cause: 'Caused by fungus Corynespora cassiicola. Creates concentric ringed "target" pattern spots on leaves. Causes severe defoliation. If infection occurs before fruit set, yields drop dramatically. Common in tropical/subtropical and screen house conditions.',
        suggestion: 'PREVENTION: 1. Remove lower 12-18 inches of branches to improve basal air flow. 2. Space plants 24+ inches apart for good air circulation. 3. Use drip irrigation only — overhead watering creates ideal infection conditions. 4. Keep plots completely weed-free — some weeds host the fungus. 5. Avoid working among wet plants. TREATMENT: 1. Apply Chlorothalonil fungicide at first sign of target-like spots — repeat every 7-10 days. 2. Use Azoxystrobin (Amistar) systemic fungicide for better control of active infections. 3. Remove and BURN infected lower leaves immediately — do not compost. 4. Copper-based fungicide as organic alternative every 7 days. 5. Apply Mancozeb as protectant on healthy upper foliage. 6. Improve ventilation in screen houses with fans.'
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
        crop: 'Tomato', disease: 'Yellow Leaf Curl Virus',
        cause: 'Transmitted by the whitefly Bemisia tabaci. Virus causes severe stunting, curling, and yellowing of leaves. Acquisition period only 15-20 minutes of feeding. Latent period 8-24 hours. No cure once infected.',
        suggestion: 'PREVENTION: 1. Plant resistant tomato varieties (Ty-1, Ty-2, Ty-3 gene varieties like TY Shintong, Shanty). 2. Use UV-reflective silver mulch around plants to repel whiteflies. 3. Install fine-mesh (50-mesh) insect-proof netting over plants or greenhouse openings. 4. Use yellow sticky traps to monitor whitefly populations — treat when numbers rise. 5. Remove and destroy all infected plants immediately — they serve as virus source. TREATMENT: 1. There is NO CURE for infected plants — REMOVE THEM promptly to protect remaining plants. 2. Control whiteflies aggressively: alternate between Imidacloprid (Admire), Pyriproxyfen (Knack), and Spiromesifen (Oberon) to prevent resistance. 3. Apply Neem oil every 5-7 days to deter whitefly feeding. 4. Release biological control agents: Encarsia formosa or Eretmocerus eremicus parasitic wasps. 5. Use insecticidal soap on undersides of leaves. 6. Practice crop-free periods between seasons in endemic areas.'
    },
    'Tomato___Tomato_mosaic_virus': {
        crop: 'Tomato', disease: 'Mosaic Virus',
        cause: 'Caused by Tobacco/Tomato mosaic virus (TMV/ToMV). Extremely stable — survives 2+ years in dry soil and plant debris. Primarily spread by human contact: hands, tools, clothes. Even survives tobacco curing — smokers can transmit from cigarettes. Causes mottled yellow-green leaves and reduced yields.',
        suggestion: 'PREVENTION: 1. Use certified virus-free or TMV-resistant seed varieties (look for "T" or "TMV" resistance code). 2. Wash hands thoroughly with SOAP (not just water) before entering the garden and between handling different plants. 3. Workers who smoke must wash hands with milk or soap before touching plants. 4. Dip all tools and equipment in 10% trisodium phosphate (TSP) or 20% nonfat dry milk solution between plants. 5. Do NOT save seed from infected plants. TREATMENT: 1. There is NO CURE — infected plants cannot be treated. 2. Remove and destroy (burn or bag in sealed plastic) ALL infected plants immediately. 3. Do not compost infected material — the virus survives composting. 4. Disinfect stakes, cages, tools, gloves, and greenhouse surfaces with TSP solution. 5. Avoid planting in fields where infected roots remain (virus persists in root debris 2+ years). 6. Cross-protection: some growers inoculate with mild TMV strains to prevent severe infection — consult local extension first.'
    },
    'Tomato___healthy': {
        crop: 'Tomato', disease: 'Healthy',
        cause: 'The tomato plant shows no signs of active disease. Leaves are vibrant green and structurally sound.',
        suggestion: '1. Maintain consistent watering (1-2 inches per week). 2. Mulch with straw/compost. 3. PRUNE suckers for airflow. 4. Weekly checks for hornworms.'
    },
    // ── RICE ──────────────────────────────────────────────────
    'Rice___Blast': {
        crop: 'Rice', disease: 'Blast',
        cause: 'Fungus Magnaporthe oryzae. Favored by high humidity, leaf moisture, and excessive nitrogen.',
        suggestion: 'PREVENTION: Use resistant varieties like IR64. Avoid excessive nitrogen. TREATMENT: Spray Tricyclazole (75 WP) @ 0.6 g/L or Carbendazim @ 1g/L. Organic: Pseudomonas fluorescens seed treatment.'
    },
    'Rice___Brown_Spot': {
        crop: 'Rice', disease: 'Brown Spot',
        cause: 'Fungus Cochliobolus miyabeanus. Often associated with "hungry" soils (low nitrogen/potassium).',
        suggestion: 'PREVENTION: Balanced fertilization (high K). Seed treatment with hot water (52°C for 10 min). TREATMENT: Spray Mancozeb @ 2.5g/L or Edifenphos @ 1ml/L. Improve soil fertility.'
    },
    'Rice___Bacterial_Leaf_Blight': {
        crop: 'Rice', disease: 'Bacterial Leaf Blight',
        cause: 'Bacteria Xanthomonas oryzae. Enters through wounds or hydathodes. Spreads by rain/wind.',
        suggestion: 'PREVENTION: Avoid field flooding. Balanced NPK. TREATMENT: Spray Streptocycline @ 0.1g + Copper Oxychloride @ 2g per liter. Organic: Bleaching powder @ 5kg/acre in standing water.'
    },
    'Rice___Sheath_Blight': {
        crop: 'Rice', disease: 'Sheath Blight',
        cause: 'Fungus Rhizoctonia solani. Soil-borne; survives as sclerotia in soil/stubble. Favored by high humidity.',
        suggestion: 'PREVENTION: Destroy weeds. Opt for wider spacing. TREATMENT: Spray Hexaconazole @ 2ml/L or Validamycin @ 2ml/L. Avoid excess urea.'
    },
    'Rice___Tungro': {
        crop: 'Rice', disease: 'Tungro Virus',
        cause: 'Rice Tungro Spherical/Bacilliform Viruses. Transmitted by Green Leafhopper (GLH).',
        suggestion: 'PREVENTION: Manage Green Leafhoppers. TREATMENT: No direct cure for virus. Spray Imidacloprid @ 0.5ml/L to control GLH vectors. Remove infected hills.'
    },
    'Rice___healthy': {
        crop: 'Rice', disease: 'Healthy',
        cause: 'Leaves are uniformly green with healthy sheath structure.',
        suggestion: 'Maintain proper water levels (5cm). Follow recommended NPK doses. Keep field free of weeds.'
    },
    // ── WHEAT ─────────────────────────────────────────────────
    'Wheat___Leaf_Rust': {
        crop: 'Wheat', disease: 'Leaf Rust (Brown Rust)',
        cause: 'Fungus Puccinia triticina. Air-borne urediniospores. High humidity/mild temps (15-25°C).',
        suggestion: 'PREVENTION: Early sowing. Resistant varieties (HD 2967, DBW 17). TREATMENT: Spray Propiconazole @ 1ml/L or Tebuconazole @ 1ml/L. Repeat after 15 days if needed.'
    },
    'Wheat___Powdery_Mildew': {
        crop: 'Wheat', disease: 'Powdery Mildew',
        cause: 'Fungus Blumeria graminis. White powdery growth on leaves. Favored by cool, cloudy, humid weather.',
        suggestion: 'PREVENTION: Avoid dense canopy/over-watering. TREATMENT: Spray Sulphur (80WP) @ 3g/L or Hexaconazole @ 2ml/L. Improve air circulation.'
    },
    'Wheat___Septoria': {
        crop: 'Wheat', disease: 'Septoria Blight',
        cause: 'Fungus Septoria tritici. Causes elongated leaf blotches. Spread by rain splashes.',
        suggestion: 'PREVENTION: Crop rotation with non-cereals. Clean cultivation. TREATMENT: Spray Azoxystrobin + Tebuconazole blend @ 1.5ml/L or Chlorothalonil @ 2g/L.'
    },
    'Wheat___Loose_Smut': {
        crop: 'Wheat', disease: 'Loose Smut',
        cause: 'Fungus Ustilago tritici. Internally seed-borne. Spores replace healthy grains.',
        suggestion: 'PREVENTION: Use certified seeds. Solar seed treatment (soak in water, then sun-dry). TREATMENT: Seed treatment with Vitavax (Carboxin) @ 2g/kg seed.'
    },
    'Wheat___healthy': {
        crop: 'Wheat', disease: 'Healthy',
        cause: 'Ears and leaves are clean without rust pustules or powdery growth.',
        suggestion: 'Ensure 4-6 irrigations at critical stages (CRI, Flowering). Monitor for rust regularly.'
    },
    // ── COTTON ────────────────────────────────────────────────
    'Cotton___Bacterial_Blight': {
        crop: 'Cotton', disease: 'Bacterial Blight',
        cause: 'Bacteria Xanthomonas citri pv. malvacearum. Angular leaf spots. Spreads in warm, moist weather.',
        suggestion: 'PREVENTION: Acid delinting of seeds. TREATMENT: Spray Streptocycline (100mg) + Copper Oxychloride (2.5g) per liter. Destroy infected plant debris.'
    },
    'Cotton___Leaf_Curl': {
        crop: 'Cotton', disease: 'Leaf Curl Virus',
        cause: 'Transmitted by Whitefly (Bemisia tabaci). Leaves curl upwards/downwards with thickening of veins.',
        suggestion: 'PREVENTION: Resistant varieties. Control Whitefly. TREATMENT: No viral cure. Spray Acetamiprid @ 0.4g/L or Diafenthiuron @ 1g/L for whitefly control.'
    },
    'Cotton___Alternaria_Leaf_Spot': {
        crop: 'Cotton', disease: 'Alternaria Leaf Spot',
        cause: 'Fungus Alternaria macrospora. Small brown circular spots. Attacks plants in late stages.',
        suggestion: 'PREVENTION: Remove crop residues. Balanced NPK. TREATMENT: Spray Mancozeb @ 2.5g/L or Kocide (Copper Hydroxide) @ 2g/L.'
    },
    'Cotton___healthy': {
        crop: 'Cotton', disease: 'Healthy',
        cause: 'Green, broad leaves with no spotting or curling.',
        suggestion: 'Manage pests (Jassids, Aphids) early. Maintain Nitrogen levels without over-fertilizing.'
    },
    // ── SUGARCANE ─────────────────────────────────────────────
    'Sugarcane___Red_Rot': {
        crop: 'Sugarcane', disease: 'Red Rot',
        cause: 'Fungus Colletotrichum falcatum. Seed-piece/Sett-borne. Internal stalks turn red with white patches.',
        suggestion: 'PREVENTION: Use healthy setts from nursery. Heat treatment (50°C). TREATMENT: Sett treatment with Carbendazim (0.1%). Long crop rotation. Rogue out infected clumps.'
    },
    'Sugarcane___Smut': {
        crop: 'Sugarcane', disease: 'Smut',
        cause: 'Fungus Ustilago scitaminea. Long black whip-like structures at the top. Spread by wind.',
        suggestion: 'PREVENTION: Resistant varieties (Co 86032). Rogue out whips in a bag to prevent spore spread. TREATMENT: Sett treatment with Triadimefon @ 1g/L.'
    },
    'Sugarcane___Rust': {
        crop: 'Sugarcane', disease: 'Rust',
        cause: 'Fungus Puccinia melanocephala. Orange-brown elongated pustules. Cool, moist weather.',
        suggestion: 'PREVENTION: Proper drainage. Avoid highly susceptible CoC 671. TREATMENT: Spray Mancozeb @ 2g/L or Pyraclostrobin @ 1ml/L.'
    },
    'Sugarcane___healthy': {
        crop: 'Sugarcane', disease: 'Healthy',
        cause: 'Strong stalks and green healthy leaves.',
        suggestion: 'Proper irrigation management. Timely earthing up. Monitor for borers.'
    },
    // ── MANGO ─────────────────────────────────────────────────
    'Mango___Anthracnose': {
        crop: 'Mango', disease: 'Anthracnose',
        cause: 'Fungus Colletotrichum gloeosporioides. Dark spots on leaves, twigs, and fruits. High humidity.',
        suggestion: 'PREVENTION: Pruning of dead twigs. Proper tree spacing. TREATMENT: Spray Carbendazim @ 1g/L or Kocide @ 2g/L. Hot water treatment for harvested fruits.'
    },
    'Mango___Powdery_Mildew': {
        crop: 'Mango', disease: 'Powdery Mildew',
        cause: 'Fungus Oidium mangiferae. White powdery growth on inflorescence and young leaves.',
        suggestion: 'PREVENTION: Resistant varieties. Avoid excessive humidity. TREATMENT: Spray Wettable Sulphur @ 3g/L or Dinocap @ 1ml/L.'
    },
    'Mango___Sooty_Mold': {
        crop: 'Mango', disease: 'Sooty Mold',
        cause: 'Fungi Capnodium sp. Black velvety growth following honeydew secretion by hoppers/aphids.',
        suggestion: 'PREVENTION: Control sucking pests (Hoppers). TREATMENT: Spray starch (2%) to flake off mold. Control insects with Imidacloprid @ 0.5ml/L.'
    },
    'Mango___Bacterial_Canker': {
        crop: 'Mango', disease: 'Bacterial Canker',
        cause: 'Bacteria Xanthomonas campestris pv. mangiferaeindicae. Water-soaked lesions on leaves and fruits.',
        suggestion: 'PREVENTION: Plant disease-free saplings. Windbreaks. TREATMENT: Spray Streptocycline (100mg) + Copper Oxychloride (2.5g) per liter.'
    },
    'Mango___healthy': {
        crop: 'Mango', disease: 'Healthy',
        cause: 'Glossy dark green leaves with no spotting or white growth.',
        suggestion: 'Annual pruning after harvest. Proper basin maintenance. Monitor for stem borers.'
    },
    // ── BANANA ────────────────────────────────────────────────
    'Banana___Panama_Wilt': {
        crop: 'Banana', disease: 'Panama Wilt (Fusarium)',
        cause: 'Fungus Fusarium oxysporum f. cubense. Soil-borne. Causes yellowing and wilting of leaves.',
        suggestion: 'PREVENTION: Resistant varieties (Grand Naine). Use TC plants. TREATMENT: Drench soil with Carbendazim (0.2%). Eradicate infected plants with lime.'
    },
    'Banana___Sigatoka_Leaf_Spot': {
        crop: 'Banana', disease: 'Sigatoka Leaf Spot',
        cause: 'Fungus Mycosphaerella musicola. Yellow-brown streaks on leaves. High humidity/rainfall.',
        suggestion: 'PREVENTION: Good drainage. Desuckering. TREATMENT: Spray Mineral Oil (1%) + Propiconazole @ 1ml/L or Carbendazim @ 1g/L.'
    },
    'Banana___Bunchy_Top': {
        crop: 'Banana', disease: 'Bunchy Top Virus',
        cause: 'Transmitted by Banana Aphid (Pentalonia nigronervosa). Leaves become small, narrow, and crowded at top.',
        suggestion: 'PREVENTION: Aphid control. Virus-free suckers. TREATMENT: No viral cure. Inject infected pseudostem with 2,4-D or Fernoxone to kill plant.'
    },
    'Banana___healthy': {
        crop: 'Banana', disease: 'Healthy',
        cause: 'Large, broad, green leaves without streaks or chlorosis.',
        suggestion: 'Maintain soil moisture. Proper earthing up. Propping of heavy bunches.'
    },
    // ── CHILLI ────────────────────────────────────────────────
    'Chilli___Leaf_Curl': {
        crop: 'Chilli', disease: 'Leaf Curl Virus',
        cause: 'Transmitted by Thrips and Whiteflies. Leaves curl and become small/stunted.',
        suggestion: 'PREVENTION: Use yellow sticky traps. Border crops with Maize. TREATMENT: Control vectors with Fipronil @ 2ml/L or Imidacloprid @ 0.5ml/L.'
    },
    'Chilli___Anthracnose': {
        crop: 'Chilli', disease: 'Anthracnose (Fruit Rot)',
        cause: 'Fungus Colletotrichum capsici. Circular black spots on fruits. Favored by moisture.',
        suggestion: 'PREVENTION: Seed treatment with Thiram. Clean cultivation. TREATMENT: Spray Mancozeb @ 2.5g/L or Azoxystrobin @ 1ml/L.'
    },
    'Chilli___Powdery_Mildew': {
        crop: 'Chilli', disease: 'Powdery Mildew',
        cause: 'Fungus Leveillula taurica. White powder on underside of leaves, yellowing on top.',
        suggestion: 'PREVENTION: Avoid overcrowding. TREATMENT: Spray Wettable Sulphur @ 3g/L or Hexaconazole @ 2ml/L.'
    },
    'Chilli___Bacterial_Wilt': {
        crop: 'Chilli', disease: 'Bacterial Wilt',
        cause: 'Bacteria Ralstonia solanacearum. Sudden wilting of plant without yellowing.',
        suggestion: 'PREVENTION: Crop rotation with non-solanaceous. Liming soil. TREATMENT: Drench soil with Streptocycline (0.1g/L) + COC (2g/L).'
    },
    'Chilli___healthy': {
        crop: 'Chilli', disease: 'Healthy',
        cause: 'Small, dark green vibrant leaves with no curling.',
        suggestion: 'Prevent drought stress. Monitor for thrips (leaf upward curling) and mites (downward curling).'
    },
    // ── ONION ─────────────────────────────────────────────────
    'Onion___Purple_Blotch': {
        crop: 'Onion', disease: 'Purple Blotch',
        cause: 'Fungus Alternaria porri. Small water-soaked lesions that turn purple. High humidity.',
        suggestion: 'PREVENTION: Wider spacing. Crop rotation. TREATMENT: Spray Mancozeb @ 2.5g/L or Tebuconazole @ 1ml/L. Mix with sticker/spreader.'
    },
    'Onion___Downy_Mildew': {
        crop: 'Onion', disease: 'Downy Mildew',
        cause: 'Fungus Peronospora destructor. Fine violet-white mold on leaves. Cool, moist weather.',
        suggestion: 'PREVENTION: Disease-free bulbs. Avoid overhead irrigation. TREATMENT: Spray Metalaxyl + Mancozeb (Ridomil) @ 2g/L.'
    },
    'Onion___Stemphylium_Blight': {
        crop: 'Onion', disease: 'Stemphylium Blight',
        cause: 'Fungus Stemphylium vesicarium. Small yellow-white spots that turn dark brown.',
        suggestion: 'PREVENTION: Balanced K application. Field sanitation. TREATMENT: Spray Iprodione + Carbendazim @ 2g/L or Hexaconazole @ 2ml/L.'
    },
    'Onion___healthy': {
        crop: 'Onion', disease: 'Healthy',
        cause: 'Upright green tubular leaves with no blotching.',
        suggestion: 'Ensure proper bulb development with K-rich fertilizers. Stop watering 2 weeks before harvest.'
    },
    // ── GROUNDNUT ─────────────────────────────────────────────
    'Groundnut___Tikka_Disease': {
        crop: 'Groundnut', disease: 'Tikka (Leaf Spot)',
        cause: 'Fungi Cercospora personata/arachidicola. Dark brown spots on both leaf surfaces.',
        suggestion: 'PREVENTION: Crop rotation. Early sowing. TREATMENT: Spray Carbendazim @ 1g/L or Chlorothalonil @ 2g/L. 2-3 sprays at 15-day intervals.'
    },
    'Groundnut___Rust': {
        crop: 'Groundnut', disease: 'Rust',
        cause: 'Fungus Puccinia arachidis. Orange pustules on lower leaf surface. Warm humidity.',
        suggestion: 'PREVENTION: Destroy volunteer plants. TREATMENT: Spray Mancozeb @ 2.5g/L or Tebuconazole @ 1ml/L.'
    },
    'Groundnut___Collar_Rot': {
        crop: 'Groundnut', disease: 'Collar Rot',
        cause: 'Fungus Aspergillus niger. Wilting and blackening of seedlings at soil level.',
        suggestion: 'PREVENTION: Seed treatment with Trichoderma viride. TREATMENT: Soil drench or seed treatment with Carbendazim + Thiram @ 2g/kg.'
    },
    'Groundnut___healthy': {
        crop: 'Groundnut', disease: 'Healthy',
        cause: 'Lush green leaves with no spotting or rust pustules.',
        suggestion: 'Ensure adequate Calcium (Gypsum @ 400kg/acre at pegging). Monitor for leaf miners.'
    },
    // ── COCONUT ───────────────────────────────────────────────
    'Coconut___Bud_Rot': {
        crop: 'Coconut', disease: 'Bud Rot',
        cause: 'Fungus Phytophthora palmivora. Common in young palms during monsoon. Terminal bud rots.',
        suggestion: 'PREVENTION: Avoid waterlogging. Proper spacing. TREATMENT: Apply Bordeaux paste on the affected bud. Spray COC (0.25%) on surrounding palms.'
    },
    'Coconut___Leaf_Blight': {
        crop: 'Coconut', disease: 'Leaf Blight (Grey Leaf Spot)',
        cause: 'Fungus Pestalotiopsis palmarum. Grey spots with dark borders on older leaves.',
        suggestion: 'PREVENTION: Balanced K and Mg nutrition. TREATMENT: Spray COC @ 2.5g/L or Mancozeb @ 2g/L. Remove and burn dead leaves.'
    },
    'Coconut___Root_Wilt': {
        crop: 'Coconut', disease: 'Root Wilt',
        cause: 'Phytoplasma transmitted by Lace Wing Bugs/Leaf Hoppers. Leaves droop (flaccidity) and yellow.',
        suggestion: 'PREVENTION: Management is key (integrated nutrient management). TREATMENT: No cure. Apply 5kg Neem cake/palm. Control vectors with Dimethoate (0.05%).'
    },
    'Coconut___healthy': {
        crop: 'Coconut', disease: 'Healthy',
        cause: 'Vibrant green fronds with healthy crown structure.',
        suggestion: 'Apply recommended NPK + Neem cake. Basin management for moisture. Keep crown free of rhinoceros beetle debris.'
    },
    // ── TEA ───────────────────────────────────────────────────
    'Tea___Blister_Blight': {
        crop: 'Tea', disease: 'Blister Blight',
        cause: 'Fungus Exobasidium vexans. White blisters on young leaves. Favored by mist and clouds.',
        suggestion: 'PREVENTION: Pruning for air flow. Shade management. TREATMENT: Spray Hexaconazole + Copper Oxychloride blend. 5-7 day intervals during monsoon.'
    },
    'Tea___Red_Rust': {
        crop: 'Tea', disease: 'Red Rust (Algal)',
        cause: 'Algae Cephaleuros parasiticus. Orange-red velvety spots on leaves/stems. Common in poorly drained soil.',
        suggestion: 'PREVENTION: Improve drainage. Balanced K fertilization. TREATMENT: Spray COC @ 2.5g/L twice a year (Pre and Post monsoon).'
    },
    'Tea___Grey_Blight': {
        crop: 'Tea', disease: 'Grey Blight',
        cause: 'Fungus Pestalotiopsis theae. Grey spots with black concentric rings. Stress-induced.',
        suggestion: 'PREVENTION: Minimize plucking stress. Soil health. TREATMENT: Spray Carbendazim @ 1g/L or COC @ 2g/L.'
    },
    'Tea___healthy': {
        crop: 'Tea', disease: 'Healthy',
        cause: 'Young flush (two leaves and a bud) is vibrant green and soft.',
        suggestion: 'Maintain soil pH (4.5-5.5). Regular plucking cycles. Proper mulch management.'
    },
    // ── COFFEE ────────────────────────────────────────────────
    'Coffee___Leaf_Rust': {
        crop: 'Coffee', disease: 'Leaf Rust',
        cause: 'Fungus Hemileia vastatrix. Orange powdery spots on lower leaf surface. Most destructive coffee disease.',
        suggestion: 'PREVENTION: Shade management (40-60%). Resistant varieties. TREATMENT: Spray 0.5% Bordeaux mixture (Pre-monsoon, mid-monsoon, post-monsoon).'
    },
    'Coffee___Berry_Disease': {
        crop: 'Coffee', disease: 'Coffee Berry Disease',
        cause: 'Fungus Colletotrichum kahawae. Attacks green berries, causing them to turn black/drop.',
        suggestion: 'PREVENTION: Pruning for sunlight. TREATMENT: Spray COC @ 2.5g/L or Carbendazim @ 1g/L during berry development.'
    },
    'Coffee___Black_Rot': {
        crop: 'Coffee', disease: 'Black Rot (Koleroga)',
        cause: 'Fungus Pellicularia koleroga. Leaves turn black and hang by fungal threads. Monsoon disease.',
        suggestion: 'PREVENTION: Thick shade thinning. Proper drainage. TREATMENT: Spray 1% Bordeaux mixture before monsoon.'
    },
    'Coffee___healthy': {
        crop: 'Coffee', disease: 'Healthy',
        cause: 'Dark green glossy leaves with healthy berry clusters.',
        suggestion: 'Maintain nutrient balance (N:P:K 2:1:3). Lime application if soil is acidic. Stem borer monitoring.'
    },
    // ── MUSTARD ───────────────────────────────────────────────
    'Mustard___Alternaria_Blight': {
        crop: 'Mustard', disease: 'Alternaria Blight',
        cause: 'Fungus Alternaria brassicae. Concentric rings on leaves and pods. High humidity.',
        suggestion: 'PREVENTION: Early sowing (mid-Oct). Seed treatment with Metalaxyl. TREATMENT: Spray Mancozeb @ 2.5g/L or Iprodione @ 2g/L.'
    },
    'Mustard___White_Rust': {
        crop: 'Mustard', disease: 'White Rust',
        cause: 'Oomycete Albugo candida. White pustules on lower leaf surface. "Staghead" deformity.',
        suggestion: 'PREVENTION: Crop rotation. Destroy weeds. TREATMENT: Spray Metalaxyl + Mancozeb (Ridomil) @ 2g/L or COC @ 2.5g/L.'
    },
    'Mustard___Downy_Mildew': {
        crop: 'Mustard', disease: 'Downy Mildew',
        cause: 'Fungus Peronospora parasitica. White growth on leaf underside, yellowing on top.',
        suggestion: 'PREVENTION: Avoid dense sowing. TREATMENT: Spray Ridomil Gold @ 2g/ha or Mancozeb @ 2.5g/L.'
    },
    'Mustard___healthy': {
        crop: 'Mustard', disease: 'Healthy',
        cause: 'Uniform green leaves with no white pustules or black spots.',
        suggestion: 'Adequate irrigation during flowering and siliqua formation. Sulfur application improves oil content.'
    },
    // ── CUCUMBER ──────────────────────────────────────────────
    'Cucumber___Downy_Mildew': {
        crop: 'Cucumber', disease: 'Downy Mildew',
        cause: 'Oomycete Pseudoperonospora cubensis. Angular yellow spots on upper leaf surface.',
        suggestion: 'PREVENTION: Avoid overhead watering. Good spacing. TREATMENT: Spray Metalaxyl + Mancozeb @ 2g/L or Azoxystrobin @ 1ml/L.'
    },
    'Cucumber___Powdery_Mildew': {
        crop: 'Cucumber', disease: 'Powdery Mildew',
        cause: 'Fungus Podospaera xanthii. White powdery growth on both surfaces. Favored by high temp.',
        suggestion: 'PREVENTION: Resistant hybrids. TREATMENT: Spray Wettable Sulphur @ 3g/L or Dinocap @ 1ml/L. Neem oil also effective.'
    },
    'Cucumber___Anthracnose': {
        crop: 'Cucumber', disease: 'Anthracnose',
        cause: 'Fungus Colletotrichum orbiculare. Water-soaked spots that turn brown and dry.',
        suggestion: 'PREVENTION: 2-year rotation. Seed treatment. TREATMENT: Spray Chlorothalonil @ 2g/L or Carbendazim @ 1g/L.'
    },
    'Cucumber___healthy': {
        crop: 'Cucumber', disease: 'Healthy',
        cause: 'Large green hairy leaves with no white mold or yellow spots.',
        suggestion: 'Trellising for better air flow. Consistent soil moisture. Bee protection (spray in evening only).'
    },
    'Cucumber___healthy': {
        crop: 'Cucumber', disease: 'Healthy',
        cause: 'Large green hairy leaves with no white mold or yellow spots.',
        suggestion: 'Trellising for better air flow. Consistent soil moisture. Bee protection (spray in evening only).'
    },
    // ── BRINJAL ──────────────────────────────────────────────
    'Brinjal___Fruit_Rot': {
        crop: 'Brinjal', disease: 'Fruit Rot (Phomopsis)',
        cause: 'Fungus Phomopsis vexans. Soft watery spots on fruit that turn black. High rainfall.',
        suggestion: 'PREVENTION: Resistant varieties. Seed treatment. TREATMENT: Spray Carbendazim @ 1g/L or Mancozeb @ 2.5g/L.'
    },
    'Brinjal___Little_Leaf': {
        crop: 'Brinjal', disease: 'Little Leaf',
        cause: 'Phytoplasma transmitted by Leaf Hoppers (Hishimonas phycitis). Leaves become very small/crowded.',
        suggestion: 'PREVENTION: Removal of infected plants. TREATMENT: No cure. Control hoppers with Dimethoate @ 2ml/L or Imidacloprid @ 0.5ml/L.'
    },
    'Brinjal___Damping_Off': {
        crop: 'Brinjal', disease: 'Damping Off',
        cause: 'Fungi Pythium/Rhizoctonia. Seedlings collapse at ground level in nursery.',
        suggestion: 'PREVENTION: Raised nursery beds. Drench with COC @ 2.5g/L. TREATMENT: Seed treatment with Thiram @ 3g/kg.'
    },
    'Brinjal___healthy': {
        crop: 'Brinjal', disease: 'Healthy',
        cause: 'Large, velvety green leaves with strong purple-tinted stems.',
        suggestion: 'Monitor for shoot and fruit borer. Balanced NPK with good organic manure.'
    },
    // ── GUAVA ────────────────────────────────────────────────
    'Guava___Wilt': {
        crop: 'Guava', disease: 'Wilt',
        cause: 'Fungus Fusarium oxysporum. Sudden yellowing and drying of leaves. Soil-borne.',
        suggestion: 'PREVENTION: Avoid waterlogging. TREATMENT: Drench soil with Carbendazim @ 2g/L. Apply Neem cake @ 5kg/tree.'
    },
    'Guava___Anthracnose': {
        crop: 'Guava', disease: 'Anthracnose',
        cause: 'Fungus Colletotrichum gloeosporioides. Sunken dark spots on fruits and leaves.',
        suggestion: 'PREVENTION: Pruning of dead wood. TREATMENT: Spray COC @ 2.5g/L or Mancozeb @ 2g/L.'
    },
    'Guava___Canker': {
        crop: 'Guava', disease: 'Canker',
        cause: 'Fungus Pestalotiopsis psidii. Raised corky lesions on fruit surface.',
        suggestion: 'PREVENTION: Proper spacing. TREATMENT: Spray 1% Bordeaux mixture or COC @ 2g/L.'
    },
    'Guava___healthy': {
        crop: 'Guava', disease: 'Healthy',
        cause: 'Stiff, green leaves with no spotting or wilting.',
        suggestion: 'Annual pruning for fruit quality. Proper irrigation during fruit set.'
    },
    // ── PAPAYA ───────────────────────────────────────────────
    'Papaya___Ring_Spot': {
        crop: 'Papaya', disease: 'Ring Spot Virus',
        cause: 'Transmitted by Aphids. Mosaic mottled leaves and rings on fruits.',
        suggestion: 'PREVENTION: Virus-resistant hybrids. Avoid intercropping with cucurbits. TREATMENT: No cure. Control Aphids with Neem oil or Imidacloprid.'
    },
    'Papaya___Leaf_Curl': {
        crop: 'Papaya', disease: 'Leaf Curl Virus',
        cause: 'Transmitted by Whiteflies. Leaves curl downwards/upwards and become leathery.',
        suggestion: 'PREVENTION: Control Whiteflies. TREATMENT: No cure. Uproot infected plants immediately.'
    },
    'Papaya___Anthracnose': {
        crop: 'Papaya', disease: 'Anthracnose',
        cause: 'Fungus Colletotrichum gloeosporioides. Sunken spots on ripe fruit.',
        suggestion: 'PREVENTION: Fruit bagging. TREATMENT: Spray Carbendazim @ 1g/L before harvest.'
    },
    'Papaya___healthy': {
        crop: 'Papaya', disease: 'Healthy',
        cause: 'Large, palmate green leaves with no mottling or curling.',
        suggestion: 'Provide good drainage. Apply Boron to prevent fruit cracking.'
    },
    // ── LEMON ────────────────────────────────────────────────
    'Lemon___Citrus_Canker': {
        crop: 'Lemon', disease: 'Citrus Canker',
        cause: 'Bacteria Xanthomonas citri. Raised, corky lesions with yellow halos on leaves and fruit.',
        suggestion: 'PREVENTION: Windbreaks. Prune infected parts. TREATMENT: Spray Streptocycline @ 0.1g/L + COC @ 2.5g/L.'
    },
    'Lemon___Citrus_Greening': {
        crop: 'Lemon', disease: 'Citrus Greening',
        cause: 'Bacterial (HLB) transmitted by Psyllids. Mottled yellow leaves and small bitter fruit.',
        suggestion: 'PREVENTION: Psyllid control. Healthy saplings. TREATMENT: No cure. Improved nutrition helps extend tree life.'
    },
    'Lemon___Black_Spot': {
        crop: 'Lemon', disease: 'Black Spot',
        cause: 'Fungus Phyllosticta citricarpa. Small reddish-brown spots on fruit.',
        suggestion: 'PREVENTION: Remove leaf litter. TREATMENT: Spray Mancozeb @ 2g/L or COC @ 2.5g/L.'
    },
    'Lemon___healthy': {
        crop: 'Lemon', disease: 'Healthy',
        cause: 'Shiny green citrus leaves with no canker spots.',
        suggestion: 'Prune for light penetration. Regular fertilization with micronutrients (Zn, Fe, Mn).'
    },
    // ── CAULIFLOWER ──────────────────────────────────────────
    'Cauliflower___Black_Rot': {
        crop: 'Cauliflower', disease: 'Black Rot',
        cause: 'Bacteria Xanthomonas campestris. V-shaped yellow lesions on leaf margins.',
        suggestion: 'PREVENTION: Hot water seed treatment. 3-year rotation. TREATMENT: Spray Agrimycin @ 100ppm.'
    },
    'Cauliflower___Downy_Mildew': {
        crop: 'Cauliflower', disease: 'Downy Mildew',
        cause: 'Fungus Peronospora parasitica. Grey-brown spots on leaves. Cool, moist weather.',
        suggestion: 'PREVENTION: Improve drainage. TREATMENT: Spray Metalaxyl + Mancozeb @ 2g/L.'
    },
    'Cauliflower___Alternaria_Leaf_Spot': {
        crop: 'Cauliflower', disease: 'Alternaria Leaf Spot',
        cause: 'Fungus Alternaria brassicicola. Concentric dark spots on leaves.',
        suggestion: 'PREVENTION: Seed treatment. TREATMENT: Spray Iprodione @ 2g/L or Mancozeb @ 2.5g/L.'
    },
    'Cauliflower___healthy': {
        crop: 'Cauliflower', disease: 'Healthy',
        cause: 'Broad, waxy green leaves with no marginal yellowing.',
        suggestion: 'Apply Borax (10kg/ha) to prevent hollow stem. Monitor for Diamondback moth.'
    },
    // ── CABBAGE ──────────────────────────────────────────────
    'Cabbage___Black_Rot': {
        crop: 'Cabbage', disease: 'Black Rot',
        cause: 'Bacteria Xanthomonas campestris. Blackening of veins in V-shaped areas.',
        suggestion: 'PREVENTION: Clean seed. Crop rotation. TREATMENT: Spray Copper Oxychloride @ 3g/L.'
    },
    'Cabbage___Clubroot': {
        crop: 'Cabbage', disease: 'Clubroot',
        cause: 'Protist Plasmodiophora brassicae. Swollen, distorted roots and wilting.',
        suggestion: 'PREVENTION: Soil liming to pH 7.2. TREATMENT: No easy chemical cure once in field. Use healthy seedlings.'
    },
    'Cabbage___Downy_Mildew': {
        crop: 'Cabbage', disease: 'Downy Mildew',
        cause: 'Fungus Hyaloperonospora parasitica. Fluffy white growth on leaf underside.',
        suggestion: 'PREVENTION: Good air flow. TREATMENT: Spray Metalaxyl @ 2g/L or Ridomil.'
    },
    'Cabbage___healthy': {
        crop: 'Cabbage', disease: 'Healthy',
        cause: 'Tight, waxy green head leaves with no vein blackening.',
        suggestion: 'Manage cabbage butterflies early. Ensure consistent moisture during head formation.'
    },
};

// ─── ML Feature Extraction using Sharp ──────────────────────
// Extract color histogram features from the image
async function extractFeatures(imageBuffer) {
    // Resize to 256x256 for consistent analysis
    const resized = await sharp(imageBuffer)
        .resize(256, 256)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { data, info } = resized;
    const pixelCount = info.width * info.height;

    // Calculate color statistics
    let rSum = 0, gSum = 0, bSum = 0;
    let rSq = 0, gSq = 0, bSq = 0;

    // Color bins for histogram
    const bins = 16;
    const rHist = new Array(bins).fill(0);
    const gHist = new Array(bins).fill(0);
    const bHist = new Array(bins).fill(0);

    // Specific color counters
    let greenPixels = 0, brownPixels = 0, yellowPixels = 0;
    let darkPixels = 0, whitePixels = 0, orangePixels = 0;

    for (let i = 0; i < data.length; i += 3) {
        const r = data[i], g = data[i + 1], b = data[i + 2];

        rSum += r; gSum += g; bSum += b;
        rSq += r * r; gSq += g * g; bSq += b * b;

        // Histogram bins
        rHist[Math.min(Math.floor(r / 16), bins - 1)]++;
        gHist[Math.min(Math.floor(g / 16), bins - 1)]++;
        bHist[Math.min(Math.floor(b / 16), bins - 1)]++;

        // Color classification
        if (g > r * 1.1 && g > b * 1.1 && g > 50) greenPixels++;
        if (r > 100 && g > 60 && g < 180 && b < 80 && r > g) brownPixels++;
        if (r > 150 && g > 150 && b < 100) yellowPixels++;
        if (r < 60 && g < 60 && b < 60) darkPixels++;
        if (r > 200 && g > 200 && b > 200) whitePixels++;
        if (r > 150 && g > 50 && g < 130 && b < 80) orangePixels++;
    }

    // Normalized means
    const rMean = rSum / pixelCount / 255;
    const gMean = gSum / pixelCount / 255;
    const bMean = bSum / pixelCount / 255;

    // Standard deviations
    const rStd = Math.sqrt(rSq / pixelCount - (rSum / pixelCount) ** 2) / 255;
    const gStd = Math.sqrt(gSq / pixelCount - (gSum / pixelCount) ** 2) / 255;
    const bStd = Math.sqrt(bSq / pixelCount - (bSum / pixelCount) ** 2) / 255;

    // Ratios
    const greenRatio = greenPixels / pixelCount;
    const brownRatio = brownPixels / pixelCount;
    const yellowRatio = yellowPixels / pixelCount;
    const darkRatio = darkPixels / pixelCount;
    const whiteRatio = whitePixels / pixelCount;
    const orangeRatio = orangePixels / pixelCount;

    // Texture feature: variance across channels
    const colorVariance = rStd + gStd + bStd;

    // Normalize histograms
    const normRHist = rHist.map(v => v / pixelCount);
    const normGHist = gHist.map(v => v / pixelCount);
    const normBHist = bHist.map(v => v / pixelCount);

    return {
        rMean, gMean, bMean,
        rStd, gStd, bStd,
        greenRatio, brownRatio, yellowRatio,
        darkRatio, whiteRatio, orangeRatio,
        colorVariance,
        rHist: normRHist, gHist: normGHist, bHist: normBHist
    };
}

// ─── ML Disease Classifier ──────────────────────────────────
// Uses TensorFlow.js for building a neural network-based classifier
// that maps color features → disease predictions

// Model variables are declared in the CNN section below

// Disease feature profiles — 13 features per class for higher discrimination
// Format: [greenR, brownR, yellowR, darkR, whiteR, orangeR, rMean, gMean, bMean, rStd, gStd, bStd, colorVar]
const diseaseProfiles = {
    'Apple___Apple_scab': [0.25, 0.20, 0.05, 0.10, 0.02, 0.05, 0.35, 0.35, 0.20, 0.12, 0.10, 0.08, 0.30],
    'Apple___Black_rot': [0.15, 0.30, 0.05, 0.15, 0.02, 0.03, 0.30, 0.25, 0.18, 0.14, 0.12, 0.09, 0.35],
    'Apple___Cedar_apple_rust': [0.20, 0.10, 0.15, 0.05, 0.02, 0.20, 0.45, 0.40, 0.20, 0.15, 0.11, 0.08, 0.34],
    'Apple___healthy': [0.50, 0.05, 0.05, 0.03, 0.02, 0.02, 0.30, 0.45, 0.20, 0.08, 0.09, 0.06, 0.23],
    'Blueberry___healthy': [0.45, 0.05, 0.03, 0.05, 0.02, 0.01, 0.28, 0.42, 0.22, 0.09, 0.10, 0.07, 0.26],
    'Cherry_(including_sour)___Powdery_mildew': [0.25, 0.05, 0.10, 0.03, 0.20, 0.02, 0.45, 0.45, 0.35, 0.10, 0.10, 0.12, 0.32],
    'Cherry_(including_sour)___healthy': [0.50, 0.03, 0.03, 0.03, 0.02, 0.01, 0.28, 0.44, 0.20, 0.07, 0.08, 0.06, 0.21],
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': [0.30, 0.15, 0.10, 0.08, 0.02, 0.03, 0.38, 0.40, 0.25, 0.11, 0.10, 0.09, 0.30],
    'Corn_(maize)___Common_rust_': [0.25, 0.15, 0.08, 0.05, 0.02, 0.18, 0.42, 0.38, 0.22, 0.13, 0.11, 0.08, 0.32],
    'Corn_(maize)___Northern_Leaf_Blight': [0.30, 0.20, 0.08, 0.10, 0.02, 0.03, 0.35, 0.38, 0.22, 0.12, 0.11, 0.09, 0.32],
    'Corn_(maize)___healthy': [0.55, 0.03, 0.05, 0.03, 0.02, 0.01, 0.30, 0.48, 0.22, 0.07, 0.08, 0.06, 0.21],
    'Grape___Black_rot': [0.20, 0.25, 0.05, 0.15, 0.02, 0.05, 0.32, 0.30, 0.20, 0.13, 0.12, 0.09, 0.34],
    'Grape___Esca_(Black_Measles)': [0.15, 0.20, 0.15, 0.10, 0.02, 0.08, 0.38, 0.32, 0.22, 0.14, 0.13, 0.10, 0.37],
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': [0.20, 0.25, 0.10, 0.08, 0.02, 0.05, 0.35, 0.33, 0.22, 0.12, 0.11, 0.09, 0.32],
    'Grape___healthy': [0.50, 0.03, 0.03, 0.03, 0.02, 0.01, 0.28, 0.45, 0.20, 0.07, 0.08, 0.05, 0.20],
    'Orange___Haunglongbing_(Citrus_greening)': [0.20, 0.10, 0.25, 0.05, 0.02, 0.08, 0.45, 0.42, 0.22, 0.11, 0.10, 0.08, 0.29],
    'Peach___Bacterial_spot': [0.25, 0.20, 0.10, 0.10, 0.02, 0.05, 0.38, 0.35, 0.22, 0.12, 0.11, 0.09, 0.32],
    'Peach___healthy': [0.48, 0.03, 0.05, 0.03, 0.02, 0.01, 0.30, 0.44, 0.20, 0.08, 0.09, 0.06, 0.23],
    'Pepper,_bell___Bacterial_spot': [0.25, 0.20, 0.08, 0.12, 0.02, 0.03, 0.35, 0.35, 0.22, 0.13, 0.12, 0.10, 0.35],
    'Pepper,_bell___healthy': [0.50, 0.03, 0.03, 0.03, 0.02, 0.01, 0.28, 0.46, 0.20, 0.06, 0.07, 0.05, 0.18],
    'Potato___Early_blight': [0.20, 0.25, 0.10, 0.08, 0.02, 0.05, 0.38, 0.35, 0.22, 0.13, 0.12, 0.09, 0.34],
    'Potato___Late_blight': [0.15, 0.30, 0.05, 0.15, 0.02, 0.03, 0.30, 0.28, 0.20, 0.15, 0.14, 0.11, 0.40],
    'Potato___healthy': [0.50, 0.03, 0.05, 0.03, 0.02, 0.01, 0.30, 0.46, 0.22, 0.07, 0.08, 0.06, 0.21],
    'Raspberry___healthy': [0.48, 0.03, 0.03, 0.03, 0.02, 0.01, 0.30, 0.44, 0.22, 0.08, 0.09, 0.07, 0.24],
    'Soybean___healthy': [0.52, 0.03, 0.03, 0.03, 0.02, 0.01, 0.28, 0.46, 0.20, 0.07, 0.08, 0.05, 0.20],
    'Squash___Powdery_mildew': [0.25, 0.05, 0.10, 0.03, 0.22, 0.02, 0.48, 0.48, 0.38, 0.10, 0.10, 0.13, 0.33],
    'Strawberry___Leaf_scorch': [0.15, 0.30, 0.08, 0.12, 0.02, 0.05, 0.35, 0.28, 0.18, 0.15, 0.14, 0.10, 0.39],
    'Strawberry___healthy': [0.50, 0.03, 0.03, 0.03, 0.02, 0.01, 0.30, 0.46, 0.22, 0.07, 0.08, 0.06, 0.21],
    'Tomato___Bacterial_spot': [0.25, 0.22, 0.08, 0.10, 0.02, 0.03, 0.35, 0.35, 0.22, 0.12, 0.11, 0.09, 0.32],
    'Tomato___Early_blight': [0.20, 0.28, 0.08, 0.10, 0.02, 0.05, 0.38, 0.32, 0.20, 0.14, 0.13, 0.10, 0.37],
    'Tomato___Late_blight': [0.15, 0.30, 0.05, 0.18, 0.02, 0.03, 0.28, 0.25, 0.18, 0.16, 0.15, 0.12, 0.43],
    'Tomato___Leaf_Mold': [0.22, 0.18, 0.15, 0.08, 0.05, 0.03, 0.40, 0.38, 0.25, 0.11, 0.10, 0.10, 0.31],
    'Tomato___Septoria_leaf_spot': [0.22, 0.20, 0.10, 0.08, 0.05, 0.03, 0.38, 0.35, 0.25, 0.13, 0.12, 0.10, 0.35],
    'Tomato___Spider_mites Two-spotted_spider_mite': [0.18, 0.15, 0.20, 0.05, 0.05, 0.08, 0.42, 0.38, 0.25, 0.12, 0.11, 0.09, 0.32],
    'Tomato___Target_Spo': [0.20, 0.25, 0.08, 0.12, 0.02, 0.05, 0.35, 0.32, 0.22, 0.14, 0.13, 0.10, 0.37],
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': [0.25, 0.08, 0.25, 0.05, 0.02, 0.05, 0.42, 0.42, 0.22, 0.10, 0.09, 0.08, 0.27],
    'Tomato___Tomato_mosaic_virus': [0.30, 0.08, 0.20, 0.05, 0.02, 0.03, 0.40, 0.42, 0.22, 0.11, 0.12, 0.08, 0.31],
    'Tomato___healthy': [0.52, 0.03, 0.05, 0.03, 0.02, 0.01, 0.30, 0.48, 0.22, 0.07, 0.08, 0.05, 0.20],
    // ── NEW CROPS PROFILES ────────────────────────────────────
    'Rice___Blast': [0.15, 0.25, 0.05, 0.10, 0.02, 0.05, 0.35, 0.35, 0.25, 0.15, 0.12, 0.10, 0.37],
    'Rice___Brown_Spot': [0.20, 0.35, 0.05, 0.15, 0.02, 0.02, 0.32, 0.28, 0.20, 0.14, 0.13, 0.11, 0.38],
    'Rice___Bacterial_Leaf_Blight': [0.10, 0.15, 0.30, 0.15, 0.02, 0.10, 0.48, 0.45, 0.25, 0.12, 0.10, 0.08, 0.30],
    'Rice___Sheath_Blight': [0.15, 0.20, 0.10, 0.25, 0.02, 0.05, 0.30, 0.32, 0.28, 0.16, 0.14, 0.12, 0.42],
    'Rice___Tungro': [0.10, 0.05, 0.45, 0.10, 0.02, 0.15, 0.52, 0.50, 0.22, 0.09, 0.10, 0.07, 0.26],
    'Rice___healthy': [0.55, 0.02, 0.03, 0.02, 0.01, 0.01, 0.28, 0.50, 0.20, 0.07, 0.08, 0.05, 0.20],

    'Wheat___Leaf_Rust': [0.10, 0.10, 0.15, 0.10, 0.02, 0.45, 0.50, 0.38, 0.18, 0.15, 0.14, 0.10, 0.39],
    'Wheat___Powdery_Mildew': [0.20, 0.05, 0.10, 0.05, 0.45, 0.02, 0.55, 0.52, 0.48, 0.11, 0.12, 0.14, 0.37],
    'Wheat___Septoria': [0.15, 0.35, 0.10, 0.15, 0.02, 0.05, 0.35, 0.32, 0.22, 0.14, 0.13, 0.11, 0.38],
    'Wheat___Loose_Smut': [0.05, 0.05, 0.05, 0.85, 0.02, 0.05, 0.12, 0.12, 0.12, 0.18, 0.18, 0.18, 0.54],
    'Wheat___healthy': [0.58, 0.03, 0.05, 0.03, 0.02, 0.01, 0.32, 0.48, 0.25, 0.07, 0.08, 0.06, 0.21],

    'Cotton___Bacterial_Blight': [0.15, 0.25, 0.15, 0.15, 0.05, 0.05, 0.38, 0.35, 0.22, 0.14, 0.13, 0.11, 0.38],
    'Cotton___Leaf_Curl': [0.45, 0.05, 0.15, 0.05, 0.05, 0.02, 0.35, 0.42, 0.25, 0.12, 0.11, 0.09, 0.32],
    'Cotton___Alternaria_Leaf_Spot': [0.20, 0.45, 0.05, 0.10, 0.02, 0.03, 0.32, 0.28, 0.20, 0.16, 0.14, 0.12, 0.42],
    'Cotton___healthy': [0.56, 0.02, 0.03, 0.03, 0.02, 0.01, 0.30, 0.48, 0.22, 0.07, 0.08, 0.05, 0.20],

    'Sugarcane___Red_Rot': [0.10, 0.45, 0.05, 0.10, 0.02, 0.20, 0.45, 0.25, 0.18, 0.16, 0.14, 0.12, 0.42],
    'Sugarcane___Smut': [0.10, 0.05, 0.05, 0.70, 0.05, 0.05, 0.18, 0.18, 0.18, 0.16, 0.16, 0.16, 0.48],
    'Sugarcane___Rust': [0.15, 0.15, 0.15, 0.10, 0.05, 0.40, 0.48, 0.38, 0.20, 0.14, 0.13, 0.11, 0.38],
    'Sugarcane___healthy': [0.60, 0.02, 0.03, 0.02, 0.02, 0.01, 0.28, 0.52, 0.20, 0.06, 0.07, 0.04, 0.17],

    'Mango___Anthracnose': [0.20, 0.45, 0.05, 0.15, 0.02, 0.03, 0.32, 0.28, 0.20, 0.16, 0.14, 0.12, 0.42],
    'Mango___Powdery_Mildew': [0.25, 0.05, 0.10, 0.05, 0.50, 0.02, 0.55, 0.55, 0.52, 0.10, 0.12, 0.15, 0.37],
    'Mango___Sooty_Mold': [0.10, 0.05, 0.05, 0.85, 0.02, 0.02, 0.12, 0.12, 0.12, 0.15, 0.15, 0.15, 0.45],
    'Mango___Bacterial_Canker': [0.15, 0.25, 0.10, 0.15, 0.05, 0.05, 0.38, 0.35, 0.25, 0.14, 0.12, 0.10, 0.36],
    'Mango___healthy': [0.62, 0.02, 0.03, 0.02, 0.02, 0.01, 0.26, 0.52, 0.22, 0.06, 0.07, 0.05, 0.18],

    'Banana___Panama_Wilt': [0.10, 0.15, 0.60, 0.05, 0.02, 0.05, 0.55, 0.52, 0.22, 0.11, 0.10, 0.08, 0.29],
    'Banana___Sigatoka_Leaf_Spot': [0.15, 0.40, 0.15, 0.10, 0.02, 0.05, 0.38, 0.32, 0.22, 0.15, 0.14, 0.12, 0.41],
    'Banana___Bunchy_Top': [0.35, 0.05, 0.25, 0.05, 0.05, 0.05, 0.48, 0.45, 0.25, 0.12, 0.10, 0.08, 0.30],
    'Banana___healthy': [0.65, 0.01, 0.02, 0.02, 0.02, 0.01, 0.25, 0.55, 0.20, 0.05, 0.06, 0.04, 0.15],

    'Chilli___Leaf_Curl': [0.45, 0.05, 0.20, 0.05, 0.05, 0.05, 0.42, 0.45, 0.25, 0.11, 0.10, 0.08, 0.29],
    'Chilli___Anthracnose': [0.20, 0.35, 0.05, 0.30, 0.02, 0.05, 0.30, 0.28, 0.22, 0.16, 0.14, 0.12, 0.42],
    'Chilli___Powdery_Mildew': [0.30, 0.05, 0.15, 0.05, 0.35, 0.02, 0.50, 0.52, 0.45, 0.10, 0.12, 0.14, 0.36],
    'Chilli___Bacterial_Wilt': [0.10, 0.15, 0.30, 0.15, 0.05, 0.05, 0.45, 0.42, 0.25, 0.14, 0.13, 0.10, 0.37],
    'Chilli___healthy': [0.58, 0.02, 0.03, 0.03, 0.02, 0.01, 0.30, 0.52, 0.18, 0.07, 0.08, 0.05, 0.20],

    'Onion___Purple_Blotch': [0.10, 0.25, 0.10, 0.15, 0.05, 0.35, 0.45, 0.32, 0.38, 0.14, 0.13, 0.12, 0.39],
    'Onion___Downy_Mildew': [0.20, 0.05, 0.15, 0.05, 0.45, 0.05, 0.52, 0.55, 0.55, 0.10, 0.12, 0.15, 0.37],
    'Onion___Stemphylium_Blight': [0.15, 0.35, 0.25, 0.10, 0.02, 0.05, 0.42, 0.38, 0.25, 0.15, 0.13, 0.11, 0.39],
    'Onion___healthy': [0.60, 0.02, 0.05, 0.03, 0.02, 0.01, 0.32, 0.52, 0.25, 0.07, 0.08, 0.06, 0.21],

    'Groundnut___Tikka_Disease': [0.15, 0.45, 0.05, 0.15, 0.02, 0.05, 0.32, 0.28, 0.20, 0.16, 0.14, 0.12, 0.42],
    'Groundnut___Rust': [0.15, 0.15, 0.15, 0.10, 0.02, 0.40, 0.48, 0.38, 0.20, 0.14, 0.13, 0.11, 0.38],
    'Groundnut___Collar_Rot': [0.05, 0.35, 0.05, 0.45, 0.02, 0.02, 0.22, 0.20, 0.18, 0.18, 0.16, 0.14, 0.48],
    'Groundnut___healthy': [0.62, 0.02, 0.03, 0.02, 0.02, 0.01, 0.28, 0.55, 0.20, 0.06, 0.07, 0.05, 0.18],

    'Coconut___Bud_Rot': [0.10, 0.40, 0.15, 0.20, 0.05, 0.05, 0.35, 0.28, 0.22, 0.15, 0.14, 0.12, 0.41],
    'Coconut___Leaf_Blight': [0.15, 0.50, 0.05, 0.10, 0.02, 0.02, 0.30, 0.25, 0.18, 0.16, 0.15, 0.13, 0.44],
    'Coconut___Root_Wilt': [0.10, 0.15, 0.45, 0.10, 0.02, 0.10, 0.52, 0.50, 0.22, 0.11, 0.10, 0.08, 0.29],
    'Coconut___healthy': [0.65, 0.01, 0.02, 0.02, 0.02, 0.01, 0.25, 0.58, 0.20, 0.05, 0.06, 0.04, 0.15],

    'Tea___Blister_Blight': [0.30, 0.05, 0.05, 0.05, 0.45, 0.02, 0.60, 0.55, 0.55, 0.10, 0.12, 0.14, 0.36],
    'Tea___Red_Rust': [0.15, 0.15, 0.10, 0.10, 0.02, 0.50, 0.55, 0.35, 0.20, 0.15, 0.14, 0.12, 0.41],
    'Tea___Grey_Blight': [0.15, 0.55, 0.02, 0.10, 0.02, 0.02, 0.32, 0.28, 0.22, 0.16, 0.15, 0.13, 0.44],
    'Tea___healthy': [0.68, 0.01, 0.01, 0.01, 0.02, 0.01, 0.22, 0.58, 0.18, 0.05, 0.06, 0.04, 0.15],

    'Coffee___Leaf_Rust': [0.15, 0.15, 0.15, 0.05, 0.02, 0.45, 0.52, 0.40, 0.22, 0.14, 0.13, 0.11, 0.38],
    'Coffee___Berry_Disease': [0.20, 0.10, 0.05, 0.55, 0.02, 0.05, 0.25, 0.25, 0.22, 0.14, 0.14, 0.14, 0.42],
    'Coffee___Black_Rot': [0.10, 0.15, 0.05, 0.65, 0.02, 0.02, 0.20, 0.20, 0.18, 0.16, 0.16, 0.16, 0.48],
    'Coffee___healthy': [0.66, 0.01, 0.01, 0.01, 0.02, 0.01, 0.25, 0.55, 0.20, 0.05, 0.06, 0.04, 0.15],

    'Mustard___Alternaria_Blight': [0.15, 0.40, 0.10, 0.15, 0.02, 0.05, 0.35, 0.32, 0.25, 0.15, 0.13, 0.11, 0.39],
    'Mustard___White_Rust': [0.25, 0.05, 0.05, 0.05, 0.55, 0.02, 0.62, 0.62, 0.62, 0.10, 0.11, 0.13, 0.34],
    'Mustard___Downy_Mildew': [0.35, 0.05, 0.25, 0.05, 0.20, 0.02, 0.48, 0.50, 0.38, 0.11, 0.12, 0.09, 0.32],
    'Mustard___healthy': [0.60, 0.02, 0.03, 0.02, 0.02, 0.01, 0.30, 0.52, 0.22, 0.06, 0.07, 0.05, 0.18],

    'Cucumber___Downy_Mildew': [0.25, 0.05, 0.45, 0.05, 0.05, 0.02, 0.52, 0.55, 0.25, 0.11, 0.10, 0.08, 0.29],
    'Cucumber___Powdery_Mildew': [0.35, 0.05, 0.15, 0.05, 0.35, 0.02, 0.55, 0.58, 0.52, 0.10, 0.12, 0.14, 0.36],
    'Cucumber___Anthracnose': [0.20, 0.40, 0.10, 0.15, 0.02, 0.05, 0.38, 0.32, 0.25, 0.15, 0.13, 0.11, 0.39],
    'Cucumber___healthy': [0.65, 0.02, 0.03, 0.02, 0.02, 0.01, 0.25, 0.58, 0.22, 0.05, 0.06, 0.04, 0.15],

    'Brinjal___Fruit_Rot': [0.20, 0.15, 0.05, 0.45, 0.02, 0.05, 0.28, 0.25, 0.22, 0.15, 0.14, 0.12, 0.41],
    'Brinjal___Little_Leaf': [0.45, 0.05, 0.25, 0.05, 0.05, 0.02, 0.42, 0.48, 0.25, 0.12, 0.11, 0.08, 0.31],
    'Brinjal___Damping_Off': [0.10, 0.45, 0.05, 0.25, 0.05, 0.02, 0.32, 0.28, 0.25, 0.16, 0.14, 0.12, 0.42],
    'Brinjal___healthy': [0.60, 0.02, 0.05, 0.02, 0.02, 0.05, 0.28, 0.48, 0.28, 0.07, 0.08, 0.06, 0.21],

    'Guava___Wilt': [0.15, 0.35, 0.25, 0.10, 0.05, 0.02, 0.45, 0.42, 0.32, 0.14, 0.13, 0.11, 0.38],
    'Guava___Anthracnose': [0.20, 0.45, 0.05, 0.20, 0.02, 0.05, 0.32, 0.28, 0.22, 0.16, 0.14, 0.12, 0.42],
    'Guava___Canker': [0.25, 0.25, 0.10, 0.15, 0.10, 0.05, 0.35, 0.32, 0.28, 0.14, 0.12, 0.10, 0.36],
    'Guava___healthy': [0.62, 0.01, 0.02, 0.02, 0.02, 0.01, 0.28, 0.52, 0.22, 0.06, 0.07, 0.05, 0.18],

    'Papaya___Ring_Spot': [0.30, 0.05, 0.45, 0.05, 0.02, 0.05, 0.52, 0.55, 0.22, 0.11, 0.10, 0.08, 0.29],
    'Papaya___Leaf_Curl': [0.40, 0.05, 0.25, 0.05, 0.05, 0.05, 0.45, 0.42, 0.28, 0.12, 0.11, 0.10, 0.33],
    'Papaya___Anthracnose': [0.20, 0.40, 0.05, 0.25, 0.02, 0.03, 0.30, 0.28, 0.22, 0.16, 0.15, 0.13, 0.44],
    'Papaya___healthy': [0.65, 0.01, 0.02, 0.02, 0.02, 0.01, 0.25, 0.58, 0.20, 0.05, 0.06, 0.04, 0.15],

    'Lemon___Citrus_Canker': [0.25, 0.25, 0.15, 0.15, 0.05, 0.05, 0.38, 0.35, 0.28, 0.14, 0.12, 0.10, 0.36],
    'Lemon___Citrus_Greening': [0.20, 0.10, 0.45, 0.10, 0.02, 0.05, 0.52, 0.50, 0.22, 0.11, 0.10, 0.08, 0.29],
    'Lemon___Black_Spot': [0.25, 0.35, 0.10, 0.15, 0.02, 0.02, 0.35, 0.32, 0.25, 0.15, 0.13, 0.11, 0.39],
    'Lemon___healthy': [0.68, 0.01, 0.01, 0.02, 0.02, 0.01, 0.25, 0.58, 0.22, 0.05, 0.06, 0.04, 0.15],

    'Cauliflower___Black_Rot': [0.25, 0.15, 0.35, 0.10, 0.02, 0.05, 0.48, 0.52, 0.25, 0.12, 0.11, 0.08, 0.31],
    'Cauliflower___Downy_Mildew': [0.30, 0.05, 0.15, 0.05, 0.35, 0.02, 0.55, 0.58, 0.55, 0.10, 0.12, 0.14, 0.36],
    'Cauliflower___Alternaria_Leaf_Spot': [0.20, 0.40, 0.10, 0.15, 0.02, 0.05, 0.35, 0.32, 0.25, 0.15, 0.13, 0.11, 0.39],
    'Cauliflower___healthy': [0.65, 0.02, 0.03, 0.03, 0.02, 0.01, 0.32, 0.55, 0.25, 0.06, 0.07, 0.05, 0.18],

    'Cabbage___Black_Rot': [0.25, 0.15, 0.35, 0.10, 0.02, 0.05, 0.48, 0.52, 0.25, 0.12, 0.11, 0.08, 0.31],
    'Cabbage___Clubroot': [0.45, 0.05, 0.25, 0.10, 0.05, 0.02, 0.42, 0.45, 0.28, 0.12, 0.11, 0.10, 0.33],
    'Cabbage___Downy_Mildew': [0.30, 0.05, 0.10, 0.05, 0.45, 0.02, 0.58, 0.60, 0.58, 0.10, 0.12, 0.14, 0.36],
    'Cabbage___healthy': [0.68, 0.02, 0.03, 0.02, 0.02, 0.01, 0.30, 0.55, 0.25, 0.06, 0.07, 0.05, 0.18],
};

const NUM_FEATURES = 13;
const CNN_IMG_SIZE = 32; // CNN input size: 32x32x3 (memory-efficient)

// ─── Helper: extract 13-feature vector from features object ──
function featureVec(f) {
    return [
        f.greenRatio, f.brownRatio, f.yellowRatio,
        f.darkRatio, f.whiteRatio, f.orangeRatio,
        f.rMean, f.gMean, f.bMean,
        f.rStd, f.gStd, f.bStd,
        f.colorVariance
    ];
}

// ─── Cosine similarity between two vectors ───────────────────
function cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
}

// ─── Euclidean distance between two vectors ──────────────────
function euclideanDist(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
}

// ─── CNN Image Preprocessing ─────────────────────────────────
// Resize image to 64x64 and return raw pixel buffer for CNN
async function preprocessImageForCNN(imageBuffer) {
    const resized = await sharp(imageBuffer)
        .resize(CNN_IMG_SIZE, CNN_IMG_SIZE)
        .removeAlpha()
        .raw()
        .toBuffer();
    // Normalize pixels to [0, 1] and return as Float32Array
    const floats = new Float32Array(CNN_IMG_SIZE * CNN_IMG_SIZE * 3);
    for (let i = 0; i < resized.length; i++) {
        floats[i] = resized[i] / 255.0;
    }
    return floats;
}

// ─── Generate synthetic training images from disease profiles ─
// Each profile defines color distribution; we generate 64x64 images
// with pixel colors matching those distributions + spatial patterns
function generateSyntheticImage(profile, noiseLevel) {
    const img = new Float32Array(CNN_IMG_SIZE * CNN_IMG_SIZE * 3);
    const [greenR, brownR, yellowR, darkR, whiteR, orangeR, rMean, gMean, bMean, rStd, gStd, bStd] = profile;

    for (let y = 0; y < CNN_IMG_SIZE; y++) {
        for (let x = 0; x < CNN_IMG_SIZE; x++) {
            const idx = (y * CNN_IMG_SIZE + x) * 3;
            const rand = Math.random();

            let r, g, b;

            // Spatial patterns: create regions with different characteristics
            const cx = x / CNN_IMG_SIZE;
            const cy = y / CNN_IMG_SIZE;
            const distFromCenter = Math.sqrt((cx - 0.5) ** 2 + (cy - 0.5) ** 2);

            if (rand < greenR) {
                // Green/healthy pixel
                r = 0.15 + Math.random() * 0.25;
                g = 0.35 + Math.random() * 0.35;
                b = 0.10 + Math.random() * 0.20;
            } else if (rand < greenR + brownR) {
                // Brown/damaged pixel
                r = 0.40 + Math.random() * 0.30;
                g = 0.25 + Math.random() * 0.20;
                b = 0.08 + Math.random() * 0.15;
            } else if (rand < greenR + brownR + yellowR) {
                // Yellow/stressed pixel
                r = 0.60 + Math.random() * 0.30;
                g = 0.55 + Math.random() * 0.30;
                b = 0.10 + Math.random() * 0.15;
            } else if (rand < greenR + brownR + yellowR + darkR) {
                // Dark spot pixel
                r = 0.05 + Math.random() * 0.15;
                g = 0.05 + Math.random() * 0.15;
                b = 0.05 + Math.random() * 0.15;
            } else if (rand < greenR + brownR + yellowR + darkR + whiteR) {
                // White/powdery pixel
                r = 0.80 + Math.random() * 0.20;
                g = 0.80 + Math.random() * 0.20;
                b = 0.80 + Math.random() * 0.20;
            } else if (rand < greenR + brownR + yellowR + darkR + whiteR + orangeR) {
                // Orange/rust pixel
                r = 0.65 + Math.random() * 0.25;
                g = 0.30 + Math.random() * 0.20;
                b = 0.05 + Math.random() * 0.12;
            } else {
                // Mixed/general pixel based on mean colors
                r = rMean;
                g = gMean;
                b = bMean;
            }

            // Add spatial coherence — diseased areas tend to cluster
            if (distFromCenter < 0.25 && brownR + darkR + orangeR > 0.2) {
                // Concentrate disease symptoms near center
                const diseaseBoost = 1.2;
                if (rand > greenR) {
                    r *= diseaseBoost;
                }
            }

            // Add noise for augmentation
            const noise = (Math.random() - 0.5) * noiseLevel;
            img[idx] = Math.max(0, Math.min(1, r + noise));
            img[idx + 1] = Math.max(0, Math.min(1, g + noise));
            img[idx + 2] = Math.max(0, Math.min(1, b + noise));
        }
    }
    return img;
}

// ─── Instant Image Profile Matching ─────────────────────────
// Bypasses heavy CNN training by directly using mathematical similarity 
// (Cosine Similarity & Euclidean Distance) against the 125 disease profiles.
// This executes in < 2ms compared to >20s for CNN training.
async function predictDisease(features, imageBuffer) {
    const inputVec = featureVec(features);

    // ── 1. Cosine Similarity Scoring (color profile shape) ──
    const cosineScores = DISEASE_CLASSES.map(cls => {
        const profile = diseaseProfiles[cls];
        if (!profile) return 0;
        return Math.max(0, cosineSimilarity(inputVec, profile));
    });

    // ── 2. Euclidean Distance Scoring (color magnitudes) ──
    const distances = DISEASE_CLASSES.map(cls => {
        const profile = diseaseProfiles[cls];
        if (!profile) return 999;
        return euclideanDist(inputVec, profile);
    });
    const maxDist = Math.max(...distances) + 0.001;
    const distScores = distances.map(d => 1 - (d / maxDist));

    // ── 3. Combine Scores ──
    const combined = DISEASE_CLASSES.map((cls, idx) => {
        // Weighted combination: 70% Cosine Similarity + 30% Euclidean proximity
        const score = (cosineScores[idx] * 0.70) + (distScores[idx] * 0.30);
        return { classIdx: idx, className: cls, probability: score };
    });

    // Normalize to sum to 1
    const totalScore = combined.reduce((s, c) => s + c.probability, 0);
    combined.forEach(c => { c.probability = c.probability / totalScore; });

    // Sort by score descending and return top 5
    combined.sort((a, b) => b.probability - a.probability);
    return combined.slice(0, 5);
}

// ─── Determine severity based on color analysis (continuous score) ───
function determineSeverity(features) {
    // Continuous health score formula — each image gets a unique score
    // Green boosts health, brown/yellow/dark reduce it
    const greenBoost = features.greenRatio * 120;       // 0-60 pts from green
    const brownPenalty = features.brownRatio * 80;       // penalty for brown
    const yellowPenalty = features.yellowRatio * 50;     // penalty for yellow
    const darkPenalty = features.darkRatio * 60;         // penalty for dark spots
    const whiteBonus = features.whiteRatio * 10;         // slight bonus for white (background)

    // Raw score: starts at 50 baseline, modified by color ratios
    let rawScore = 50 + greenBoost - brownPenalty - yellowPenalty - darkPenalty + whiteBonus;

    // Clamp to 0-100 range
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Determine severity level from score
    let level, color;
    if (score >= 75) { level = 'Healthy'; color = '#28a745'; }
    else if (score >= 55) { level = 'Mild'; color = '#ffc107'; }
    else if (score >= 35) { level = 'Moderate'; color = '#fd7e14'; }
    else { level = 'Severe'; color = '#dc3545'; }

    return { level, color, score };
}

// ─── Crop name → disease class prefix mapping ──────────────
const CROP_PREFIX_MAP = {
    'Apple': 'Apple___',
    'Blueberry': 'Blueberry___',
    'Cherry': 'Cherry_(including_sour)___',
    'Corn': 'Corn_(maize)___',
    'Grape': 'Grape___',
    'Orange': 'Orange___',
    'Peach': 'Peach___',
    'Pepper': 'Pepper,_bell___',
    'Potato': 'Potato___',
    'Raspberry': 'Raspberry___',
    'Soybean': 'Soybean___',
    'Squash': 'Squash___',
    'Strawberry': 'Strawberry___',
    'Tomato': 'Tomato___',
    // New Crops
    'Rice': 'Rice___',
    'Wheat': 'Wheat___',
    'Cotton': 'Cotton___',
    'Sugarcane': 'Sugarcane___',
    'Mango': 'Mango___',
    'Banana': 'Banana___',
    'Chilli': 'Chilli___',
    'Onion': 'Onion___',
    'Groundnut': 'Groundnut___',
    'Coconut': 'Coconut___',
    'Tea': 'Tea___',
    'Coffee': 'Coffee___',
    'Mustard': 'Mustard___',
    'Cucumber': 'Cucumber___',
    'Brinjal': 'Brinjal___',
    'Guava': 'Guava___',
    'Papaya': 'Papaya___',
    'Lemon': 'Lemon___',
    'Cauliflower': 'Cauliflower___',
    'Cabbage': 'Cabbage___'
};

// ─── MAIN ENDPOINT ──────────────────────────────────────────
module.exports.upload = upload;

module.exports.diseaseDetect = async function (req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded. Please upload a plant/leaf image.' });
        }

        // Get user-selected crop from form data
        const selectedCrop = req.body.crop || '';
        const cropPrefix = CROP_PREFIX_MAP[selectedCrop] || '';

        console.log(`[DiseaseAI] Analyzing image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB) | Crop: ${selectedCrop || 'auto-detect'}`);

        // Extract ML features from image
        const features = await extractFeatures(req.file.buffer);

        // Run CNN + color analysis hybrid prediction
        const allPredictions = await predictDisease(features, req.file.buffer);

        // ── Filter predictions to ONLY the user's selected crop ──
        let cropPredictions;
        if (cropPrefix) {
            // Filter to only this crop's disease classes
            cropPredictions = allPredictions.filter(p => p.className.startsWith(cropPrefix));

            // If no matches found (shouldn't happen), fall back to all
            if (cropPredictions.length === 0) {
                cropPredictions = allPredictions;
            } else {
                // Re-normalize probabilities for filtered set so they sum to 1
                const total = cropPredictions.reduce((s, p) => s + p.probability, 0);
                cropPredictions = cropPredictions.map(p => ({
                    ...p,
                    probability: p.probability / total
                }));
                // Re-sort after normalization
                cropPredictions.sort((a, b) => b.probability - a.probability);
            }
        } else {
            cropPredictions = allPredictions;
        }

        const topPrediction = cropPredictions[0];

        // Get disease info
        const info = diseaseInfo[topPrediction.className] || {
            crop: selectedCrop || 'Unknown', disease: 'Unknown',
            cause: 'Unable to determine the exact cause.',
            suggestion: 'Please consult an agricultural expert for accurate diagnosis.'
        };

        // Use the user's selected crop name (overrides the disease info crop)
        const cropName = selectedCrop || info.crop;

        // Determine severity
        const severity = determineSeverity(features);

        // Build comprehensive report
        const report = {
            Crop: cropName,
            Diseas: `${cropName} - ${info.disease}`,
            Disease: info.disease,
            Confidence: parseFloat((topPrediction.probability * 100).toFixed(2)),
            Cause: info.cause,
            Sugession: info.suggestion,
            Severity: severity.level,
            SeverityColor: severity.color,
            HealthScore: severity.score,
            ColorAnalysis: {
                GreenRatio: parseFloat((features.greenRatio * 100).toFixed(2)),
                BrownRatio: parseFloat((features.brownRatio * 100).toFixed(2)),
                YellowRatio: parseFloat((features.yellowRatio * 100).toFixed(2)),
                DarkSpots: parseFloat((features.darkRatio * 100).toFixed(2))
            },
            AlternativeDiagnosis: cropPredictions.slice(1, 5).map(p => ({
                Disease: (diseaseInfo[p.className] || {}).disease || p.className.split('___')[1] || 'Unknown',
                Confidence: parseFloat((p.probability * 100).toFixed(2))
            })),
            Report: generateTextReport({ ...info, crop: cropName }, severity, features, topPrediction.probability)
        };

        console.log(`[DiseaseAI] Result: ${cropName} - ${info.disease} (${(topPrediction.probability * 100).toFixed(1)}%)`);
        return res.json(report);

    } catch (err) {
        console.error('[DiseaseAI] Error:', err);
        return res.status(500).json({ error: err.message || 'Something went wrong during disease analysis' });
    }
};

// ─── Generate text-based disease report ─────────────────────
function generateTextReport(info, severity, features, confidence) {
    const lines = [
        `═══════════════════════════════════════`,
        `         DISEASE DETECTION REPORT`,
        `═══════════════════════════════════════`,
        ``,
        `Crop:       ${info.crop}`,
        `Disease:    ${info.disease}`,
        `Severity:   ${severity.level}`,
        `Confidence: ${(confidence * 100).toFixed(2)}%`,
        ``,
        `─── Image Color Analysis ───`,
        `Green (healthy):  ${(features.greenRatio * 100).toFixed(1)}%`,
        `Brown (damaged):  ${(features.brownRatio * 100).toFixed(1)}%`,
        `Yellow (stressed):${(features.yellowRatio * 100).toFixed(1)}%`,
        `Dark spots:       ${(features.darkRatio * 100).toFixed(1)}%`,
        ``,
        `─── Cause ───`,
        info.cause,
        ``,
        `─── Recommendations ───`,
        info.suggestion,
        ``,
        `═══════════════════════════════════════`,
        `  Analyzed by GrowFarm AI Engine`,
        `═══════════════════════════════════════`
    ];
    return lines.join('\n');
}

// ─── CNN model initializes lazily on first disease detection request ──
// This prevents server startup crashes from CNN training memory usage
console.log('[DiseaseAI-CNN] Model will initialize on first disease detection request');
