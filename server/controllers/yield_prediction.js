// ============================================================
// Yield Prediction Engine — Local multi-model approach
// Uses Gujarat agricultural data (APY) for district × crop × season predictions
// ============================================================

const path = require('path');
const fs = require('fs');

// ─── Load & parse GUJARAT.csv ────────────────────────────────
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

const gujaratDataPath = path.join(__dirname, '..', '..', 'ML FAST API', 'Data', 'GUJARAT.csv');
const cropDataPath = path.join(__dirname, '..', '..', 'ML FAST API', 'Data', 'crop_recommendation.csv');

let gujaratData = [];
let cropRecData = [];

try {
    gujaratData = loadCSV(gujaratDataPath);
    console.log(`[YieldAI] Loaded ${gujaratData.length} Gujarat APY records`);
} catch (e) {
    console.warn('[YieldAI] GUJARAT.csv not found, yield prediction will use crop_recommendation.csv fallback');
}

try {
    cropRecData = loadCSV(cropDataPath);
} catch (e) {
    console.warn('[YieldAI] crop_recommendation.csv not found');
}

// ─── Build lookup tables ─────────────────────────────────────
// Group by District → Season → Crop with averaged Area, Production, Yield
const yieldLookup = {};
const allDistricts = new Set();
const allSeasons = new Set();
const allCrops = new Set();

gujaratData.forEach(row => {
    const dist = (row.District_Name || '').toUpperCase();
    const season = (row.Season || '').trim();
    const crop = (row.Crop || '').trim();
    const area = parseFloat(row.Area) || 0;
    const prod = parseFloat(row.Production) || 0;

    if (!dist || !season || !crop || area <= 0) return;

    allDistricts.add(dist);
    allSeasons.add(season);
    allCrops.add(crop);

    const key = `${dist}|${season}|${crop}`;
    if (!yieldLookup[key]) {
        yieldLookup[key] = { totalArea: 0, totalProd: 0, count: 0 };
    }
    yieldLookup[key].totalArea += area;
    yieldLookup[key].totalProd += prod;
    yieldLookup[key].count += 1;
});

console.log(`[YieldAI] Built lookup: ${allDistricts.size} districts, ${allSeasons.size} seasons, ${allCrops.size} crops`);

// ─── Soil suitability scoring from crop_recommendation data ──
const cropSoilProfiles = {};
const FEATURES = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

cropRecData.forEach(row => {
    const crop = (row.label || '').trim().toLowerCase();
    if (!crop) return;
    if (!cropSoilProfiles[crop]) {
        cropSoilProfiles[crop] = { count: 0 };
        FEATURES.forEach(f => { cropSoilProfiles[crop][f] = 0; });
    }
    FEATURES.forEach(f => {
        cropSoilProfiles[crop][f] += parseFloat(row[f]) || 0;
    });
    cropSoilProfiles[crop].count += 1;
});

// Average the profiles
Object.keys(cropSoilProfiles).forEach(crop => {
    const p = cropSoilProfiles[crop];
    FEATURES.forEach(f => { p[f] = p[f] / p.count; });
});

// ─── Weather API ─────────────────────────────────────────────
async function getWeather(city) {
    const apiKey = '1fa9ff4126d95b8db54f3897a208e91c';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== 200) return { temperature: 28, humidity: 65 };
        return {
            temperature: data.main.temp - 273.15,
            humidity: data.main.humidity
        };
    } catch {
        return { temperature: 28, humidity: 65 };
    }
}

// ─── Soil suitability score (0-100) ──────────────────────────
function soilSuitabilityScore(crop, N, P, K, ph) {
    const profile = cropSoilProfiles[crop.toLowerCase()];
    if (!profile) return 70; // default moderate suitability

    const nDiff = Math.abs(N - profile.N) / (profile.N || 1);
    const pDiff = Math.abs(P - profile.P) / (profile.P || 1);
    const kDiff = Math.abs(K - profile.K) / (profile.K || 1);
    const phDiff = Math.abs(ph - profile.ph) / (profile.ph || 1);

    // Score: 100 if perfect match, lower with more deviation
    const avgDeviation = (nDiff + pDiff + kDiff + phDiff) / 4;
    return Math.max(20, Math.min(100, Math.round(100 - avgDeviation * 60)));
}

// ─── MAIN ENDPOINT ──────────────────────────────────────────
module.exports.yieldPrediction = async function (req, res) {
    try {
        const { dist, season, crop, area, N, P, K, Ph } = req.query;

        if (!dist || !season || !crop || !area) {
            return res.status(400).json({ error: 'Missing parameters. Required: dist, season, crop, area' });
        }

        const distUpper = dist.toUpperCase();
        const areaNum = parseFloat(area) || 1;
        const nVal = parseFloat(N) || 50;
        const pVal = parseFloat(P) || 50;
        const kVal = parseFloat(K) || 40;
        const phVal = parseFloat(Ph) || 6.5;

        // Try exact match first
        let key = `${distUpper}|${season}|${crop}`;
        let matchData = yieldLookup[key];

        // Try case-insensitive crop match
        if (!matchData) {
            const cropLower = crop.toLowerCase();
            const matchKey = Object.keys(yieldLookup).find(k => {
                const parts = k.split('|');
                return parts[0] === distUpper &&
                    parts[1].toLowerCase() === season.toLowerCase() &&
                    parts[2].toLowerCase() === cropLower;
            });
            if (matchKey) matchData = yieldLookup[matchKey];
        }

        // Try any-season match
        if (!matchData) {
            const cropLower = crop.toLowerCase();
            const matchKey = Object.keys(yieldLookup).find(k => {
                const parts = k.split('|');
                return parts[0] === distUpper &&
                    parts[2].toLowerCase() === cropLower;
            });
            if (matchKey) matchData = yieldLookup[matchKey];
        }

        // Try any-district match for crop + season
        if (!matchData) {
            const cropLower = crop.toLowerCase();
            const seasonLower = season.toLowerCase();
            const matchKeys = Object.keys(yieldLookup).filter(k => {
                const parts = k.split('|');
                return parts[1].toLowerCase() === seasonLower &&
                    parts[2].toLowerCase() === cropLower;
            });
            if (matchKeys.length > 0) {
                // Average all district data for this crop+season
                let totalArea = 0, totalProd = 0, totalCount = 0;
                matchKeys.forEach(mk => {
                    totalArea += yieldLookup[mk].totalArea;
                    totalProd += yieldLookup[mk].totalProd;
                    totalCount += yieldLookup[mk].count;
                });
                matchData = { totalArea, totalProd, count: totalCount };
            }
        }

        // Get weather data
        const weather = await getWeather(dist);

        // Compute soil suitability
        const soilScore = soilSuitabilityScore(crop, nVal, pVal, kVal, phVal);

        let production, yieldPerHa, method;

        if (matchData) {
            // Historical average yield per hectare
            const avgYield = matchData.totalProd / matchData.totalArea;

            // Adjust yield based on soil suitability (±30%)
            const soilMultiplier = 0.7 + (soilScore / 100) * 0.6; // range: 0.7 to 1.3

            yieldPerHa = Math.round(avgYield * soilMultiplier * 100) / 100;
            production = Math.round(yieldPerHa * areaNum * 100) / 100;
            method = 'Historical data + soil analysis';
        } else {
            // Fallback: estimate from crop recommendation data
            yieldPerHa = Math.round((soilScore / 100) * 25 * 100) / 100; // rough estimate
            production = Math.round(yieldPerHa * areaNum * 100) / 100;
            method = 'Estimated (no historical record for this combination)';
        }

        // Build response
        const response = {
            District: dist,
            Season: season,
            Crop: crop,
            Area: areaNum,
            Production: production,
            Yield: yieldPerHa,
            Unit: 'Tonnes/Hectare',
            SoilSuitability: soilScore,
            Weather: {
                Temperature: Math.round(weather.temperature * 10) / 10,
                Humidity: weather.humidity
            },
            SoilInput: { N: nVal, P: pVal, K: kVal, Ph: phVal },
            Method: method,
            HistoricalRecords: matchData ? matchData.count : 0,
            Recommendations: generateYieldRecommendations(crop, nVal, pVal, kVal, phVal, soilScore)
        };

        console.log(`[YieldAI] Prediction for ${crop} in ${dist} (${season}): Production=${production}, Yield=${yieldPerHa}`);
        return res.json(response);

    } catch (err) {
        console.error('Yield prediction error:', err);
        return res.status(500).json({ error: err.message || 'Something went wrong' });
    }
};

// ─── Generate yield improvement recommendations ─────────────
function generateYieldRecommendations(crop, N, P, K, ph, soilScore) {
    const tips = [];
    const profile = cropSoilProfiles[crop.toLowerCase()];

    if (profile) {
        if (N < profile.N * 0.7) tips.push(`Increase Nitrogen by ~${Math.round(profile.N - N)} units for optimal ${crop} growth.`);
        if (N > profile.N * 1.3) tips.push(`Reduce Nitrogen by ~${Math.round(N - profile.N)} units to prevent excessive vegetative growth.`);
        if (P < profile.P * 0.7) tips.push(`Add ${Math.round(profile.P - P)} units of Phosphorus through DAP/SSP fertilizer.`);
        if (K < profile.K * 0.7) tips.push(`Add ${Math.round(profile.K - K)} units of Potassium through MOP fertilizer.`);
        if (Math.abs(ph - profile.ph) > 1) {
            tips.push(ph < profile.ph
                ? `Soil is too acidic (pH ${ph}). Consider adding agricultural lime to raise pH to ~${profile.ph.toFixed(1)}.`
                : `Soil is too alkaline (pH ${ph}). Consider adding gypsum to lower pH to ~${profile.ph.toFixed(1)}.`);
        }
    }

    if (soilScore >= 80) tips.push('Your soil conditions are excellent for this crop. Maintain current practices.');
    else if (soilScore >= 60) tips.push('Soil conditions are moderate. Consider adjusting NPK values based on suggestions above.');
    else tips.push('Soil conditions need improvement. Focus on balancing NPK and pH levels.');

    return tips;
}

// ─── Metadata endpoint for dropdowns ────────────────────────
module.exports.yieldMetadata = function (req, res) {
    res.json({
        districts: [...allDistricts].sort(),
        seasons: [...allSeasons].sort(),
        crops: [...allCrops].sort()
    });
};
