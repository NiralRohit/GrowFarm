const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// ─── Import the disease info database for enriched responses ──
const diseaseDetection = require('./disease_detection');

// ML FastAPI Python server URL (where the real trained PyTorch model runs)
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8006';

// --- Crop Profiles ---
const CROP_PROFILES = {
    wheat: { N: 70, P: 42, K: 30, temp: 20, humidity: 55, ph: 6.5, rainfall: 70 },
    barley: { N: 60, P: 38, K: 25, temp: 17, humidity: 55, ph: 6.5, rainfall: 60 },
    sorghum: { N: 65, P: 35, K: 30, temp: 28, humidity: 50, ph: 6.2, rainfall: 55 },
    soybean: { N: 30, P: 60, K: 50, temp: 25, humidity: 65, ph: 6.5, rainfall: 90 },
    groundnut: { N: 25, P: 50, K: 40, temp: 28, humidity: 55, ph: 6.2, rainfall: 75 },
    mustard: { N: 50, P: 32, K: 28, temp: 20, humidity: 50, ph: 6.8, rainfall: 45 },
    sunflower: { N: 70, P: 50, K: 40, temp: 25, humidity: 55, ph: 6.8, rainfall: 70 },
    sesame: { N: 40, P: 28, K: 25, temp: 30, humidity: 55, ph: 6.2, rainfall: 55 },
    sugarcane: { N: 100, P: 50, K: 50, temp: 30, humidity: 75, ph: 6.8, rainfall: 200 },
    tomato: { N: 100, P: 70, K: 70, temp: 25, humidity: 65, ph: 6.5, rainfall: 75 },
    potato: { N: 70, P: 70, K: 100, temp: 18, humidity: 75, ph: 5.8, rainfall: 75 },
    rice: { N: 80, P: 40, K: 40, temp: 27, humidity: 82, ph: 6.5, rainfall: 200 },
    maize: { N: 100, P: 40, K: 20, temp: 24, humidity: 65, ph: 6.2, rainfall: 75 },
    cotton: { N: 100, P: 60, K: 40, temp: 28, humidity: 65, ph: 6.0, rainfall: 75 },
    banana: { N: 100, P: 75, K: 50, temp: 28, humidity: 80, ph: 6.5, rainfall: 150 },
    chilli: { N: 100, P: 60, K: 60, temp: 28, humidity: 65, ph: 6.5, rainfall: 75 }
};

const CROP_CARE_GUIDES = {
    wheat: "Water properly during tillering stage. Apply nitrogen fertilizer in split doses. Watch for rust diseases.",
    barley: "Tolerates lower fertility but responds well to early P. Avoid waterlogging condition.",
    sorghum: "Drought resistant, but needs soil moisture during heading. Limit early N to prevent excessive vegetative growth.",
    soybean: "Ensure seeds are inoculated with rhizobium. Apply P and K before planting.",
    groundnut: "Needs loose, sandy loam soil for pod development. Add gypsum for better seed filling.",
    mustard: "Sensitive to waterlogging. Needs sulphur addition for higher oil content. Watch for aphids.",
    sunflower: "Requires deep soil preparation. Regular irrigation during flowering and seed setting is crucial.",
    sesame: "Highly sensitive to waterlogging. Avoid heavy rainfall areas or ensure excellent drainage.",
    sugarcane: "Requires high water and heavy N, P, K applications natively split over the long growing season.",
    tomato: "Needs staking and regular consistent watering to prevent blossom end rot. High K requirement.",
    potato: "Requires earthing up. Avoid excessive N late in the season. Essential to monitor for late blight.",
    rice: "Maintain standing water during vegetative stage. Apply split nitrogen. Watch for blast and stem borers.",
    maize: "High nitrogen feeder. Crucial water needs during tasseling and silking stages.",
    cotton: "Deep tillage required. Avoid water stress during square and boll formation. Regular pest scouting.",
    banana: "Provide heavy farmyard manure. Ensure frequent irrigation and wind breaks. High K requirement.",
    chilli: "Requires well-drained soil. Regular application of N in split doses. Watch for thrips and mites."
};

const calculateMatchScore = (input, profile) => {
    let score = 0;
    score += Math.pow((input.N - profile.N) / 100, 2) * 2.0;
    score += Math.pow((input.P - profile.P) / 100, 2) * 1.5;
    score += Math.pow((input.K - profile.K) / 100, 2) * 1.5;
    score += Math.pow((input.temp - profile.temp) / 50, 2) * 1.0;
    score += Math.pow((input.humidity - profile.humidity) / 100, 2) * 0.8;
    score += Math.pow((input.ph - profile.ph) / 14, 2) * 1.2;
    score += Math.pow((input.rainfall - profile.rainfall) / 400, 2) * 1.0;
    return Math.sqrt(score);
};

/**
 * POST /api/smart/crop-recommend
 */
exports.recommendCrop = async (req, res) => {
    try {
        const { N, P, K, temp, humidity, ph, rainfall } = req.body;
        if (N === undefined || P === undefined || K === undefined) {
          return res.status(400).json({ message: "NPK values are required for recommendation." });
        }
        const input = { 
            N: Number(N), P: Number(P), K: Number(K), 
            temp: Number(temp) || 25, humidity: Number(humidity) || 70, 
            ph: Number(ph) || 6.5, rainfall: Number(rainfall) || 100 
        };
        const results = Object.entries(CROP_PROFILES).map(([crop, profile]) => {
            const distance = calculateMatchScore(input, profile);
            const matchPercentage = Math.max(0, 100 - (distance * 100));
            return {
                crop: crop.charAt(0).toUpperCase() + crop.slice(1),
                confidence: matchPercentage.toFixed(2),
                suitability: matchPercentage > 85 ? 'High' : (matchPercentage > 70 ? 'Medium' : 'Low'),
                profile: profile,
                care: CROP_CARE_GUIDES[crop] || 'Maintain balanced nutrition and regular monitoring.'
            };
        });
        const top3 = results.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
        res.status(200).json({ status: "Success", recommendations: top3, inputParameters: input });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * POST /api/smart/disease-detect
 * STRATEGY:
 *   1. PRIMARY:   Gemini Vision AI (knows ALL crops/diseases, highest accuracy)
 *   2. SECONDARY:  PyTorch ML model via FastAPI (38 PlantVillage classes)
 *   3. FALLBACK:  Node.js color-histogram engine (basic)
 */
exports.detectDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image file." });
        }

        const selectedCrop = req.body.crop || '';
        console.log(`[DiseaseAI] Analyzing image: ${req.file.originalname || 'upload'} (${(req.file.size / 1024).toFixed(1)}KB)${selectedCrop ? ` Crop hint: ${selectedCrop}` : ''}`);

        // ─── Strategy 1: Gemini Vision AI (Best accuracy, ALL crops) ───
        try {
            const { GoogleGenAI } = require('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });

            const imageBase64 = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype || 'image/jpeg';

            const cropHint = selectedCrop ? `The farmer says this is a ${selectedCrop} plant.` : '';

            const visionPrompt = `You are an expert plant pathologist with 30+ years of experience specializing in Indian agriculture. Analyze this plant/leaf/crop image and provide a disease diagnosis.

${cropHint}

IMPORTANT RULES:
1. If the image is NOT a plant/leaf/crop image (e.g., a person, car, random object), respond with: {"isPlant": false}
2. If this IS a plant image, provide a thorough diagnosis.
3. Be VERY specific about the disease name, its scientific cause, and treatment.
4. Consider ALL Indian crops: Rice, Wheat, Cotton, Groundnut, Tomato, Potato, Corn, Mango, Banana, Sugarcane, Chilli, Onion, Soybean, Mustard, Cumin, Coconut, Tea, Coffee, Guava, Papaya, Lemon, Apple, Grape, Peach, Cherry, Blueberry, Strawberry, Squash, Raspberry, Pepper, Cucumber, Brinjal, Cauliflower, Cabbage, and all other crops.
5. For healthy plants, still identify the crop and confirm health status.

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "isPlant": true,
  "crop": "Tomato",
  "disease": "Early Blight",
  "isHealthy": false,
  "confidence": 92,
  "scientificName": "Alternaria solani",
  "cause": "Detailed cause explanation with conditions that favor this disease",
  "severity": "Moderate",
  "symptoms": "Detailed visible symptoms observed in the image",
  "treatment": {
    "chemical": "Specific chemical treatment with dosage. E.g.: Spray Mancozeb 75WP @ 2.5g/L or Chlorothalonil @ 2g/L every 7-10 days",
    "organic": "Specific organic/biological treatment. E.g.: Apply Trichoderma viride @ 5g/L or Neem oil 5ml/L",
    "prevention": "Specific prevention measures for future crops"
  },
  "immediateAction": "What the farmer should do RIGHT NOW",
  "alternativeDiagnosis": [
    {"disease": "Septoria Leaf Spot", "confidence": 15},
    {"disease": "Target Spot", "confidence": 8}
  ]
}`;

            const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
            let geminiResult = null;

            for (const modelName of models) {
                try {
                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: [{
                            role: 'user',
                            parts: [
                                { inlineData: { mimeType, data: imageBase64 } },
                                { text: visionPrompt }
                            ]
                        }],
                        config: { maxOutputTokens: 2048, temperature: 0.2 },
                    });

                    let text = response.text.trim();
                    // Strip markdown code fences if present
                    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

                    geminiResult = JSON.parse(text);
                    console.log(`[DiseaseAI-Gemini] ${modelName}: ${geminiResult.crop} - ${geminiResult.disease} (${geminiResult.confidence}%)`);
                    break;
                } catch (modelErr) {
                    console.log(`[DiseaseAI-Gemini] ${modelName} failed: ${(modelErr.message || '').substring(0, 60)}`);
                    continue;
                }
            }

            if (geminiResult) {
                // Not a plant image
                if (geminiResult.isPlant === false) {
                    return res.status(200).json({
                        status: "Not a Plant Image",
                        modelUsed: "Gemini Vision AI",
                        Crop: "N/A",
                        Disease: "Not a plant/leaf image",
                        Diseas: "Not a plant image",
                        Confidence: 0,
                        Cause: "The uploaded image does not appear to be a plant, leaf, or crop. Please upload a clear photo of a plant leaf or affected crop part.",
                        Sugession: "TIPS FOR BEST RESULTS: 1. Take a close-up photo of the affected leaf. 2. Ensure good lighting. 3. Include both healthy and diseased parts if possible. 4. Avoid blurry images.",
                        Severity: "N/A",
                        SeverityColor: "gray",
                        HealthScore: 0,
                        ColorAnalysis: null,
                        AlternativeDiagnosis: [],
                        Report: "Please upload a clear image of a plant leaf for disease analysis."
                    });
                }

                // Valid plant diagnosis
                const isHealthy = geminiResult.isHealthy || geminiResult.disease === 'Healthy' || geminiResult.disease === 'No Disease';
                const severity = isHealthy ? 'Healthy' : (geminiResult.severity || (geminiResult.confidence > 80 ? 'Severe' : geminiResult.confidence > 50 ? 'Moderate' : 'Mild'));
                const severityColor = isHealthy ? 'green' : (severity === 'Severe' ? 'red' : severity === 'Moderate' ? 'orange' : 'yellow');

                const suggestion = [
                    `CAUSE: ${geminiResult.cause}`,
                    `SYMPTOMS: ${geminiResult.symptoms || 'See image'}`,
                    `PREVENTION: ${geminiResult.treatment?.prevention || 'Maintain crop hygiene'}`,
                    `TREATMENT: ${geminiResult.treatment?.chemical || 'Consult local KVK'}`,
                    `ORGANIC: ${geminiResult.treatment?.organic || 'Neem oil spray'}`,
                    `IMMEDIATE ACTION: ${geminiResult.immediateAction || 'Monitor closely'}`
                ].join('\n\n');

                return res.status(200).json({
                    status: "Identification Complete",
                    modelUsed: "Gemini Vision AI",
                    Crop: geminiResult.crop,
                    Disease: isHealthy ? `${geminiResult.crop} — Healthy ✅` : `${geminiResult.crop} — ${geminiResult.disease}`,
                    Diseas: isHealthy ? `${geminiResult.crop} healthy` : `${geminiResult.crop} ${geminiResult.disease}`,
                    Confidence: geminiResult.confidence || 90,
                    Cause: geminiResult.cause,
                    Sugession: suggestion,
                    Severity: severity,
                    SeverityColor: severityColor,
                    HealthScore: isHealthy ? 95 : Math.max(10, 100 - (geminiResult.confidence || 80)),
                    ColorAnalysis: null,
                    AlternativeDiagnosis: (geminiResult.alternativeDiagnosis || []).map(a => ({
                        Disease: `${geminiResult.crop} — ${a.disease}`,
                        Confidence: a.confidence
                    })),
                    Report: `🔬 AI Analysis by Gemini Vision\n\nCrop: ${geminiResult.crop}\nDisease: ${geminiResult.disease}\nScientific Name: ${geminiResult.scientificName || 'N/A'}\nConfidence: ${geminiResult.confidence}%\nSeverity: ${severity}\n\n${suggestion}`,
                    Treatment: geminiResult.treatment
                });
            }
        } catch (geminiErr) {
            console.warn(`[DiseaseAI] Gemini Vision unavailable: ${(geminiErr.message || '').substring(0, 60)}`);
        }

        // ─── Strategy 2: PyTorch ML model via FastAPI ───
        try {
            const formData = new FormData();
            formData.append('file', req.file.buffer, {
                filename: req.file.originalname || 'image.jpg',
                contentType: req.file.mimetype || 'image/jpeg'
            });

            const mlResponse = await axios.post(`${ML_API_URL}/Crop_Diseas`, formData, {
                headers: formData.getHeaders(),
                timeout: 30000,
                maxContentLength: 50 * 1024 * 1024
            });

            const mlData = mlResponse.data;
            const realConfidence = mlData.Confidence || 85;
            console.log(`[DiseaseAI-PyTorch] Result: ${mlData.Diseas} (${realConfidence}%)`);

            const diseaseKey = findDiseaseKey(mlData.RawClass || mlData.Diseas);
            const diseaseInfoData = getDiseaseInfo(diseaseKey);

            const isHealthy = diseaseInfoData.disease === 'No Disease' || diseaseInfoData.disease === 'Healthy';
            const severity = isHealthy ? 'Healthy' : (realConfidence > 80 ? 'Severe' : realConfidence > 50 ? 'Moderate' : 'Mild');

            return res.status(200).json({
                status: "Identification Complete",
                modelUsed: "PyTorch ResNet9",
                Crop: diseaseInfoData.crop,
                Disease: diseaseInfoData.disease,
                Diseas: mlData.Diseas,
                Confidence: realConfidence,
                Cause: diseaseInfoData.cause,
                Sugession: diseaseInfoData.suggestion,
                Severity: severity,
                SeverityColor: isHealthy ? 'green' : (severity === 'Severe' ? 'red' : 'orange'),
                HealthScore: isHealthy ? 95 : Math.max(10, 100 - realConfidence),
                StepsAndSuggestions: mlData['Steps & Suggestions'],
                ColorAnalysis: null,
                AlternativeDiagnosis: mlData.Alternatives || [],
                Report: `Identified: ${mlData.Diseas}\n\n${mlData['Steps & Suggestions']}`
            });

        } catch (mlError) {
            console.warn(`[DiseaseAI] Python ML server unavailable (${mlError.message}), falling back to Node.js engine`);
            
            // ─── Strategy 3: Fallback to Node.js engine ───
            return diseaseDetection.diseaseDetect(req, res);
        }

    } catch (error) {
        console.error('[Disease Detection Error]', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─── Helper: Map cleaned disease name back to disease info key ───
function findDiseaseKey(diseaseName) {
    if (!diseaseName) return null;
    
    // The ML model returns names like "Tomato Early blight"
    // We need to map back to keys like "Tomato___Early_blight"
    const normalized = diseaseName.trim().toLowerCase().replace(/___/g, ' ').replace(/_/g, ' ');
    
    const diseaseInfoKeys = Object.keys(DISEASE_INFO_DB);
    
    // Try exact normalized match first
    for (const key of diseaseInfoKeys) {
        const keyNorm = key.replace(/___/g, ' ').replace(/_/g, ' ').toLowerCase();
        if (keyNorm === normalized) return key;
    }
    
    // Try partial match
    for (const key of diseaseInfoKeys) {
        const keyNorm = key.replace(/___/g, ' ').replace(/_/g, ' ').toLowerCase();
        if (normalized.includes(keyNorm) || keyNorm.includes(normalized)) return key;
    }
    
    // Try matching just the disease part (after the crop name)
    const parts = normalized.split(' ');
    if (parts.length >= 2) {
        const cropPart = parts[0];
        const diseasePart = parts.slice(1).join(' ');
        for (const key of diseaseInfoKeys) {
            const keyNorm = key.replace(/___/g, ' ').replace(/_/g, ' ').toLowerCase();
            if (keyNorm.includes(cropPart) && keyNorm.includes(diseasePart)) return key;
        }
    }
    
    return null;
}

// ─── Helper: Get disease info from key ───
function getDiseaseInfo(key) {
    if (key && DISEASE_INFO_DB[key]) {
        return DISEASE_INFO_DB[key];
    }
    return {
        crop: 'Unknown',
        disease: 'Unknown Disease',
        cause: 'Unable to determine the exact cause from the image. Please consult an agricultural expert.',
        suggestion: 'PREVENTION: Maintain good field hygiene. TREATMENT: Consult your nearest Krishi Vigyan Kendra (KVK) for specific treatment.'
    };
}

// ─── Disease Info Database (compact) ───
const DISEASE_INFO_DB = {
    'Apple___Apple_scab': { crop: 'Apple', disease: 'Apple Scab', cause: 'Caused by fungus Venturia inaequalis. Favored by wet, cool weather in spring.', suggestion: 'PREVENTION: Plant scab-resistant varieties. Rake fallen leaves. TREATMENT: Spray Captan or Myclobutanil at green tip stage every 7-10 days. Neem oil as organic alternative.' },
    'Apple___Black_rot': { crop: 'Apple', disease: 'Black Rot', cause: 'Caused by fungus Diplodia seriata. Infects dead and living tissue through wounds.', suggestion: 'PREVENTION: Prune dead branches. Remove mummified fruit. TREATMENT: Apply Captan or Thiophanate-methyl from pink bud stage. Copper-based fungicide for organic.' },
    'Apple___Cedar_apple_rust': { crop: 'Apple', disease: 'Cedar Apple Rust', cause: 'Caused by Gymnosporangium juniperi-virginianae. Requires juniper + apple hosts.', suggestion: 'PREVENTION: Plant rust-resistant varieties. Remove nearby junipers. TREATMENT: Myclobutanil (Immunox) at flower bud color, repeat every 7 days.' },
    'Apple___healthy': { crop: 'Apple', disease: 'No Disease', cause: 'Your apple crop appears healthy!', suggestion: 'MAINTENANCE: Continue regular monitoring. Prune for air circulation. Apply dormant oil spray in late winter.' },
    'Blueberry___healthy': { crop: 'Blueberry', disease: 'No Disease', cause: 'Your blueberry crop appears healthy!', suggestion: 'MAINTENANCE: Keep soil pH 4.5-5.5. Mulch with pine needles. Prune old canes annually.' },
    'Cherry_(including_sour)___Powdery_mildew': { crop: 'Cherry', disease: 'Powdery Mildew', cause: 'Caused by Podosphaera clandestina. White powdery growth on young leaves.', suggestion: 'PREVENTION: Remove suckers. Use drip irrigation. TREATMENT: Sulfur-based fungicide. Neem oil spray every 7 days.' },
    'Cherry_(including_sour)___healthy': { crop: 'Cherry', disease: 'No Disease', cause: 'Your cherry crop appears healthy!', suggestion: 'MAINTENANCE: Good air circulation. Monitor during humid periods.' },
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': { crop: 'Corn', disease: 'Gray Leaf Spot', cause: 'Caused by Cercospora zeae-maydis. Hinders photosynthesis in warm, humid conditions.', suggestion: 'PREVENTION: Choose resistant hybrids. Rotate crops. TREATMENT: Apply Azoxystrobin or Propiconazole at VT-R1 stage.' },
    'Corn_(maize)___Common_rust_': { crop: 'Corn', disease: 'Common Rust', cause: 'Caused by Puccinia sorghi. Brick-red pustules on leaves. Favored by cool, humid weather.', suggestion: 'PREVENTION: Plant resistant hybrids. Plant early. TREATMENT: Mancozeb or Propiconazole when pustules appear before silking.' },
    'Corn_(maize)___Northern_Leaf_Blight': { crop: 'Corn', disease: 'Northern Leaf Blight', cause: 'Caused by Exserohilum turcicum. Cigar-shaped gray-green lesions.', suggestion: 'PREVENTION: Use resistant hybrids. Rotate crops. TREATMENT: Foliar fungicide (Azoxystrobin) between V14 and VT stage.' },
    'Corn_(maize)___healthy': { crop: 'Corn', disease: 'No Disease', cause: 'Your corn crop appears healthy!', suggestion: 'MAINTENANCE: Monitor for rust and leaf spots. Proper nitrogen fertilization.' },
    'Grape___Black_rot': { crop: 'Grape', disease: 'Black Rot', cause: 'Caused by Guignardia bidwellii. Overwinters in mummified berries.', suggestion: 'PREVENTION: Remove ALL mummified berries. Prune for air flow. TREATMENT: Myclobutanil or Mancozeb at 2-4 inch shoot length.' },
    'Grape___Esca_(Black_Measles)': { crop: 'Grape', disease: 'Black Measles', cause: 'Caused by Phaeoacremonium + Phaeomoniella fungi. Enters through pruning wounds.', suggestion: 'PREVENTION: Delay pruning. Apply wound protectant after cuts. TREATMENT: Cut away cankered portions. Apply Thiophanate-methyl as wound dressing.' },
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': { crop: 'Grape', disease: 'Leaf Blight', cause: 'Caused by Pseudocercospora vitis. Brown spots on leaves in warm, humid conditions.', suggestion: 'PREVENTION: Resistant varieties. Good air circulation. TREATMENT: Mancozeb or Carbendazim (Bavistin) 1g/L.' },
    'Grape___healthy': { crop: 'Grape', disease: 'No Disease', cause: 'Your grape crop appears healthy!', suggestion: 'MAINTENANCE: Regular canopy management. Preventive copper spray during dormancy.' },
    'Orange___Haunglongbing_(Citrus_greening)': { crop: 'Orange', disease: 'Citrus Greening', cause: 'Caused by Candidatus Liberibacter bacteria, transmitted by Asian citrus psyllid.', suggestion: 'PREVENTION: Disease-free nursery stock. Control psyllids with Imidacloprid. TREATMENT: No cure — enhance foliar nutrition to extend tree life.' },
    'Peach___Bacterial_spot': { crop: 'Peach', disease: 'Bacterial Spot', cause: 'Caused by Xanthomonas arboricola. Spreads through water films on wet tissue.', suggestion: 'PREVENTION: Plant resistant varieties. Use drip irrigation. TREATMENT: Copper bactericide at leaf fall and bud swell.' },
    'Peach___healthy': { crop: 'Peach', disease: 'No Disease', cause: 'Your peach crop appears healthy!', suggestion: 'MAINTENANCE: Open center pruning. Dormant copper spray.' },
    'Pepper,_bell___Bacterial_spot': { crop: 'Pepper', disease: 'Bacterial Spot', cause: 'Caused by Xanthomonas species. Spread by rain splash and handling wet plants.', suggestion: 'PREVENTION: Disease-free seed. Rotate 2-3 years. TREATMENT: Copper hydroxide + Mancozeb every 5-7 days.' },
    'Pepper,_bell___healthy': { crop: 'Pepper', disease: 'No Disease', cause: 'Your pepper crop appears healthy!', suggestion: 'MAINTENANCE: Consistent drip watering. Adequate calcium for blossom end rot prevention.' },
    'Potato___Early_blight': { crop: 'Potato', disease: 'Early Blight', cause: 'Caused by Alternaria solani. Concentric ring spots on lower leaves first.', suggestion: 'PREVENTION: Certified seed potatoes. Rotate 3 years. TREATMENT: Chlorothalonil or Mancozeb every 7-10 days. Alternate with Azoxystrobin.' },
    'Potato___Late_blight': { crop: 'Potato', disease: 'Late Blight', cause: 'Caused by Phytophthora infestans. EMERGENCY disease — can destroy entire crop in days.', suggestion: 'PREVENTION: Certified seed only. Resistant varieties. TREATMENT: ACT IMMEDIATELY — Chlorothalonil every 5-7 days. Metalaxyl for active infections.' },
    'Potato___healthy': { crop: 'Potato', disease: 'No Disease', cause: 'Your potato crop appears healthy!', suggestion: 'MAINTENANCE: Hill soil around stems. Watch for late blight warnings.' },
    'Raspberry___healthy': { crop: 'Raspberry', disease: 'No Disease', cause: 'Your raspberry crop appears healthy!', suggestion: 'MAINTENANCE: Prune old canes. Good drainage. 3-4 inch mulch.' },
    'Soybean___healthy': { crop: 'Soybean', disease: 'No Disease', cause: 'Your soybean crop appears healthy!', suggestion: 'MAINTENANCE: Monitor for sudden death syndrome. Proper crop rotation.' },
    'Squash___Powdery_mildew': { crop: 'Squash', disease: 'Powdery Mildew', cause: 'Caused by Podosphaera xanthii. White powdery growth on leaf surfaces.', suggestion: 'PREVENTION: Resistant varieties. Wide spacing. TREATMENT: Potassium bicarbonate. Neem oil every 7 days. Milk spray (1:9 ratio).' },
    'Strawberry___Leaf_scorch': { crop: 'Strawberry', disease: 'Leaf Scorch', cause: 'Caused by Diplocarpon earliana. Purple-red spots that merge and create scorched look.', suggestion: 'PREVENTION: Resistant varieties. Drip irrigation only. TREATMENT: Captan or Myclobutanil every 7-10 days during wet weather.' },
    'Strawberry___healthy': { crop: 'Strawberry', disease: 'No Disease', cause: 'Your strawberry crop appears healthy!', suggestion: 'MAINTENANCE: Straw mulch. Renovate beds after harvest.' },
    'Tomato___Bacterial_spot': { crop: 'Tomato', disease: 'Bacterial Spot', cause: 'Caused by Xanthomonas species. Spread by rain splash and handling.', suggestion: 'PREVENTION: Hot water-treated seed. Rotate 3+ years. TREATMENT: Copper + Mancozeb every 5-7 days. Bacillus subtilis as biological control.' },
    'Tomato___Early_blight': { crop: 'Tomato', disease: 'Early Blight', cause: 'Caused by Alternaria tomatophila/solani. Dark concentric target-like rings on lower leaves.', suggestion: 'PREVENTION: Disease-free seed. Rotate 2-3 years. Mulch to prevent splash. TREATMENT: Chlorothalonil every 7-10 days. Alternate with Azoxystrobin.' },
    'Tomato___Late_blight': { crop: 'Tomato', disease: 'Late Blight', cause: 'Caused by Phytophthora infestans. Large water-soaked dark lesions. EXTREMELY aggressive.', suggestion: 'PREVENTION: Resistant varieties (Mountain Magic, Iron Lady). TREATMENT: ACT IMMEDIATELY — Chlorothalonil every 5-7 days. Metalaxyl for active infections.' },
    'Tomato___Leaf_Mold': { crop: 'Tomato', disease: 'Leaf Mold', cause: 'Caused by Passalora fulva. Olive-green velvety mold on leaf undersides. Greenhouse disease.', suggestion: 'PREVENTION: Keep humidity below 85%. Good ventilation. TREATMENT: Chlorothalonil every 7-10 days. Prune lower leaves aggressively.' },
    'Tomato___Septoria_leaf_spot': { crop: 'Tomato', disease: 'Septoria Leaf Spot', cause: 'Caused by Septoria lycopersici. Small circular spots with dark borders and tan centers.', suggestion: 'PREVENTION: Clean seed. Rotate 3+ years. Mulch heavily. TREATMENT: Chlorothalonil or Mancozeb every 7-10 days. Remove ALL infected leaves.' },
    'Tomato___Spider_mites Two-spotted_spider_mite': { crop: 'Tomato', disease: 'Spider Mite', cause: 'Caused by Tetranychus urticae. Favored by hot, dry, dusty conditions and excess nitrogen.', suggestion: 'PREVENTION: Avoid broad-spectrum insecticides. Water regularly. TREATMENT: Strong water jet. Insecticidal soap. Neem oil. Release predatory mites.' },
    'Tomato___Target_Spot': { crop: 'Tomato', disease: 'Target Spot', cause: 'Caused by Corynespora cassiicola. Concentric ringed target pattern spots on leaves.', suggestion: 'PREVENTION: Remove lower branches for airflow. 24+ inch spacing. TREATMENT: Chlorothalonil every 7-10 days. Remove and burn infected leaves.' },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': { crop: 'Tomato', disease: 'Yellow Leaf Curl Virus', cause: 'Transmitted by whitefly Bemisia tabaci. Severe stunting and leaf curling. No cure.', suggestion: 'PREVENTION: Resistant varieties. Silver reflective mulch. Fine-mesh netting. TREATMENT: No cure — REMOVE infected plants. Control whiteflies with Imidacloprid.' },
    'Tomato___Tomato_mosaic_virus': { crop: 'Tomato', disease: 'Mosaic Virus', cause: 'Caused by TMV/ToMV. Extremely stable — survives 2+ years in soil. Spread by hands and tools.', suggestion: 'PREVENTION: TMV-resistant varieties. Wash hands with SOAP. Dip tools in 10% TSP. TREATMENT: No cure — remove and burn infected plants.' },
    'Tomato___healthy': { crop: 'Tomato', disease: 'No Disease', cause: 'Your tomato crop appears healthy!', suggestion: 'MAINTENANCE: Consistent watering. Mulch with straw. Prune suckers for airflow. Weekly checks for hornworms.' },
};
