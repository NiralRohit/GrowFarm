// ============================================================
// Crop Recommendation Engine — Gaussian Naive Bayes + KNN Ensemble
// Trained on 2200+ data points from crop_recommendation.csv
// ============================================================

const path = require('path');
const fs = require('fs');

// ─── Load & parse CSV data ──────────────────────────────────
function loadCSV(filepath) {
    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.trim().split('\n').map(l => l.replace('\r', ''));
    const headers = lines[0].split(',');
    return lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h.trim()] = values[i] ? values[i].trim() : ''; });
        return obj;
    });
}

const cropDataPath = path.join(__dirname, '..', '..', 'ML FAST API', 'Data', 'crop_recommendation.csv');
const fertDataPath = path.join(__dirname, '..', '..', 'ML FAST API', 'Data', 'FertilizerData.csv');

const cropData = loadCSV(cropDataPath);
const fertData = loadCSV(fertDataPath);

const FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

// ─── Parse all data into numeric arrays ─────────────────────
const allSamples = cropData.map(row => ({
    features: FEATURES.map(f => parseFloat(row[f])),
    label: row.label
}));

const allLabels = [...new Set(allSamples.map(s => s.label))];
console.log(`[CropAI] Loaded ${allSamples.length} samples across ${allLabels.length} crops`);

// ─── GAUSSIAN NAIVE BAYES CLASSIFIER ────────────────────────
// For each crop, compute mean and variance for every feature
// P(class | X) ∝ P(class) × Π P(xi | class)
// where P(xi | class) follows a Gaussian distribution

const classPriors = {};  // P(class)
const classMeans = {};   // μ for each feature per class
const classVars = {};    // σ² for each feature per class

allLabels.forEach(label => {
    const samples = allSamples.filter(s => s.label === label);
    const n = samples.length;
    classPriors[label] = n / allSamples.length;

    const means = FEATURES.map((_, fi) => {
        return samples.reduce((sum, s) => sum + s.features[fi], 0) / n;
    });
    classMeans[label] = means;

    const vars = FEATURES.map((_, fi) => {
        const mean = means[fi];
        const variance = samples.reduce((sum, s) => sum + Math.pow(s.features[fi] - mean, 2), 0) / n;
        return variance;
    });
    classVars[label] = vars;
});

// Variance smoothing (same technique as scikit-learn's GaussianNB var_smoothing)
// Prevents over-confidence when a feature has very low variance for a class
const allVariances = allLabels.flatMap(l => classVars[l]);
const maxVariance = Math.max(...allVariances);
const VAR_SMOOTHING = maxVariance * 1e-1; // Smooth by 10% of max variance (generous smoothing)

allLabels.forEach(label => {
    classVars[label] = classVars[label].map(v => v + VAR_SMOOTHING);
});

// Gaussian PDF: P(x | μ, σ²) = (1/√(2πσ²)) × exp(-(x-μ)²/(2σ²))
function gaussianLogPdf(x, mean, variance) {
    const logCoeff = -0.5 * Math.log(2 * Math.PI * variance);
    const logExp = -Math.pow(x - mean, 2) / (2 * variance);
    return logCoeff + logExp;
}

function naiveBayesPredict(features) {
    const logProbs = {};
    // Feature importance for NB: [N, P, K, temperature, humidity, ph, rainfall]
    // Live weather features get lower weight since they are snapshot not seasonal
    const NB_WEIGHTS = [1.5, 1.5, 1.5, 0.3, 0.3, 1.2, 1.3];

    allLabels.forEach(label => {
        // Start with log prior
        let logProb = Math.log(classPriors[label]);

        // Add weighted log-likelihood for each feature
        features.forEach((x, fi) => {
            const logLik = gaussianLogPdf(x, classMeans[label][fi], classVars[label][fi]);
            logProb += NB_WEIGHTS[fi] * Math.max(logLik, -15);
        });

        logProbs[label] = logProb;
    });

    // Convert log-probabilities to probabilities using log-sum-exp trick
    const maxLog = Math.max(...Object.values(logProbs));
    const expSum = Object.values(logProbs).reduce((sum, lp) => sum + Math.exp(lp - maxLog), 0);
    const logNormalize = maxLog + Math.log(expSum);

    const probs = {};
    allLabels.forEach(label => {
        probs[label] = Math.exp(logProbs[label] - logNormalize);
    });

    return probs;
}

// ─── K-NEAREST NEIGHBORS CLASSIFIER ─────────────────────────
// Uses all 2200 samples with feature-weighted distance scoring
// Soil inputs (farmer-provided) are weighted more than live weather

// Feature importance weights: [N, P, K, temperature, humidity, ph, rainfall]
// Soil data (farmer-provided) gets higher weight than live API data (temp/humidity)
const FEATURE_WEIGHTS = [1.5, 1.5, 1.5, 0.5, 0.4, 1.2, 1.3];

// Z-score normalization parameters (for KNN distance)
const featureMeans = FEATURES.map((_, fi) =>
    allSamples.reduce((sum, s) => sum + s.features[fi], 0) / allSamples.length
);
const featureStds = FEATURES.map((_, fi) => {
    const mean = featureMeans[fi];
    const variance = allSamples.reduce((sum, s) => sum + Math.pow(s.features[fi] - mean, 2), 0) / allSamples.length;
    return Math.sqrt(variance) || 1;
});

function normalizeFeatures(features) {
    return features.map((x, fi) => (x - featureMeans[fi]) / featureStds[fi]);
}

function weightedDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + FEATURE_WEIGHTS[i] * Math.pow(val - b[i], 2), 0));
}

function knnPredict(features, k = 25) {
    const normInput = normalizeFeatures(features);

    // Calculate weighted distance to every sample
    const distances = allSamples.map(sample => ({
        label: sample.label,
        distance: weightedDistance(normInput, normalizeFeatures(sample.features))
    }));

    // Sort and take top K
    distances.sort((a, b) => a.distance - b.distance);
    const topK = distances.slice(0, k);

    // Distance-weighted voting
    const votes = {};
    allLabels.forEach(l => { votes[l] = 0; });

    topK.forEach(neighbor => {
        const weight = 1 / (neighbor.distance + 1e-6);
        votes[neighbor.label] += weight;
    });

    // Normalize to probabilities
    const totalWeight = Object.values(votes).reduce((a, b) => a + b, 0);
    const probs = {};
    allLabels.forEach(label => {
        probs[label] = votes[label] / totalWeight;
    });

    return probs;
}

// ─── ENSEMBLE: Combine NB + KNN ─────────────────────────────
function ensemblePredict(features) {
    const nbProbs = naiveBayesPredict(features);
    const knnProbs = knnPredict(features);

    // Weighted ensemble: 25% NB + 75% KNN
    // KNN dominates because it handles real-world input variation better
    const combined = {};
    allLabels.forEach(label => {
        combined[label] = 0.25 * nbProbs[label] + 0.75 * knnProbs[label];
    });

    // Re-normalize
    const total = Object.values(combined).reduce((a, b) => a + b, 0);
    allLabels.forEach(label => {
        combined[label] = combined[label] / total;
    });

    return combined;
}

// ─── Crop profiles for comparison charts ────────────────────
const cropProfiles = {};
allLabels.forEach(label => {
    const obj = {};
    FEATURES.forEach((f, fi) => { obj[f] = classMeans[label][fi]; });
    cropProfiles[label] = obj;
});

// ─── Fertilizer lookup ──────────────────────────────────────
const fertLookup = {};
fertData.forEach(row => {
    fertLookup[row.Crop] = {
        N: parseFloat(row.N),
        P: parseFloat(row.P),
        K: parseFloat(row.K),
        pH: parseFloat(row.pH)
    };
});

// ─── Weather API ────────────────────────────────────────────
async function getWeather(city) {
    const apiKey = '1fa9ff4126d95b8db54f3897a208e91c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod !== 200) throw new Error(`City "${city}" not found`);
    return {
        temperature: data.main.temp - 273.15,
        humidity: data.main.humidity
    };
}

// ─── Fertilizer suggestion generator ────────────────────────
function getFertilizerSuggestion(crop, userN, userP, userK) {
    const fert = fertLookup[crop];
    if (!fert) return 'No specific fertilizer recommendation available for this crop.';

    const suggestions = [];
    const nDiff = fert.N - userN;
    const pDiff = fert.P - userP;
    const kDiff = fert.K - userK;

    if (nDiff > 10) {
        suggestions.push(`Nitrogen is low by ${Math.round(nDiff)} units. Consider using Urea or Ammonium Sulphate.`);
    } else if (nDiff < -10) {
        suggestions.push(`Nitrogen is high by ${Math.round(Math.abs(nDiff))} units. Reduce nitrogen-based fertilizers.`);
    }

    if (pDiff > 10) {
        suggestions.push(`Phosphorus is low by ${Math.round(pDiff)} units. Consider using SSP or DAP.`);
    } else if (pDiff < -10) {
        suggestions.push(`Phosphorus is high by ${Math.round(Math.abs(pDiff))} units. Avoid phosphorus-rich fertilizers.`);
    }

    if (kDiff > 10) {
        suggestions.push(`Potassium is low by ${Math.round(kDiff)} units. Consider using MOP or SOP.`);
    } else if (kDiff < -10) {
        suggestions.push(`Potassium is high by ${Math.round(Math.abs(kDiff))} units. Reduce potassium fertilizers.`);
    }

    if (suggestions.length === 0) {
        suggestions.push(`Your soil nutrients are well-balanced for ${crop}. Maintain current practices.`);
    }

    return suggestions.join(' ');
}

// ─── MAIN ENDPOINT ──────────────────────────────────────────
module.exports.cropRecommendation = async function (req, res) {
    try {
        const { city, N, P, K, ph, rain } = req.query;

        if (!city || N === undefined || P === undefined || K === undefined || ph === undefined || rain === undefined) {
            return res.status(400).json({ error: 'Missing parameters. Required: city, N, P, K, ph, rain' });
        }

        const n = parseFloat(N);
        const p = parseFloat(P);
        const k = parseFloat(K);
        const phVal = parseFloat(ph);
        const rainfall = parseFloat(rain);

        // Get live weather for the city
        const weather = await getWeather(city);
        const features = [n, p, k, weather.temperature, weather.humidity, phVal, rainfall];

        // Run ensemble prediction
        const probs = ensemblePredict(features);

        // Get top 5 crops sorted by probability
        const sorted = Object.entries(probs)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const response = sorted.map(([crop, prob]) => {
            const profile = cropProfiles[crop];
            const fert = fertLookup[crop] || { N: profile.N, P: profile.P, K: profile.K, pH: profile.ph };
            const fertSuggestion = getFertilizerSuggestion(crop, n, p, k);

            return {
                Crop: crop,
                Prob: parseFloat(prob.toFixed(4)),
                Requir_Nitro: Math.round(fert.N),
                Require_Phosp: Math.round(fert.P),
                Require_cal: Math.round(fert.K),
                Requir_Ph: fert.pH,
                Require_temp: Math.round(profile.temperature * 100) / 100,
                Require_humidity: Math.round(profile.humidity * 100) / 100,
                Require_rain: Math.round(profile.rainfall * 100) / 100,
                User_temp: Math.round(weather.temperature * 100) / 100,
                User_humidity: weather.humidity,
                Fert: fertSuggestion
            };
        });

        console.log(`[CropAI] Prediction for ${city}: ${sorted.map(([c, p]) => `${c}(${(p * 100).toFixed(1)}%)`).join(', ')}`);
        return res.json({ Top: response });

    } catch (err) {
        console.error('Crop recommendation error:', err);
        return res.status(500).json({ error: err.message || 'Something went wrong' });
    }
};
