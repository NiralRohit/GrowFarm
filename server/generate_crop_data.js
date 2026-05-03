// Script to generate 28 new crop entries for crop_recommendation.csv
// Each crop gets 100 samples with realistic Gaussian-distributed values
// Based on Indian agricultural research data for N, P, K, temp, humidity, pH, rainfall

const fs = require('fs');
const path = require('path');

// Box-Muller transform for generating normally distributed random numbers
function gaussRandom(mean, stddev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stddev;
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function generateSamples(crop, params, count = 100) {
    const rows = [];
    for (let i = 0; i < count; i++) {
        const N = clamp(gaussRandom(params.N, params.Nstd), 0, 200).toFixed(0);
        const P = clamp(gaussRandom(params.P, params.Pstd), 0, 200).toFixed(0);
        const K = clamp(gaussRandom(params.K, params.Kstd), 0, 250).toFixed(0);
        const temp = clamp(gaussRandom(params.temp, params.tempStd), 5, 50);
        const humidity = clamp(gaussRandom(params.humidity, params.humStd), 10, 100);
        const ph = clamp(gaussRandom(params.ph, params.phStd), 3, 10);
        const rainfall = clamp(gaussRandom(params.rainfall, params.rainStd), 10, 400);

        rows.push(`${N},${P},${K},${temp.toFixed(8)},${humidity.toFixed(8)},${ph.toFixed(9)},${rainfall.toFixed(7)},${crop}`);
    }
    return rows;
}

// ─── New crop profiles (28 crops) ──────────────────────────
// based on Indian agriculture data
const newCrops = {
    // CEREALS & GRAINS
    wheat: { N: 70, Nstd: 10, P: 42, Pstd: 8, K: 30, Kstd: 6, temp: 20, tempStd: 3, humidity: 55, humStd: 8, ph: 6.5, phStd: 0.5, rainfall: 70, rainStd: 18 },
    barley: { N: 60, Nstd: 10, P: 38, Pstd: 7, K: 25, Kstd: 5, temp: 17, tempStd: 3, humidity: 55, humStd: 7, ph: 6.5, phStd: 0.4, rainfall: 60, rainStd: 15 },
    sorghum: { N: 65, Nstd: 12, P: 35, Pstd: 8, K: 30, Kstd: 6, temp: 28, tempStd: 3, humidity: 50, humStd: 8, ph: 6.2, phStd: 0.5, rainfall: 55, rainStd: 15 },

    // PULSES
    soybean: { N: 30, Nstd: 8, P: 60, Pstd: 8, K: 50, Kstd: 8, temp: 25, tempStd: 3, humidity: 65, humStd: 8, ph: 6.5, phStd: 0.4, rainfall: 90, rainStd: 20 },

    // OILSEEDS
    groundnut: { N: 25, Nstd: 8, P: 50, Pstd: 8, K: 40, Kstd: 8, temp: 28, tempStd: 3, humidity: 55, humStd: 8, ph: 6.2, phStd: 0.5, rainfall: 75, rainStd: 18 },
    mustard: { N: 50, Nstd: 8, P: 32, Pstd: 6, K: 28, Kstd: 6, temp: 20, tempStd: 3, humidity: 50, humStd: 8, ph: 6.8, phStd: 0.5, rainfall: 45, rainStd: 12 },
    sunflower: { N: 70, Nstd: 10, P: 50, Pstd: 8, K: 40, Kstd: 8, temp: 25, tempStd: 3, humidity: 55, humStd: 8, ph: 6.8, phStd: 0.5, rainfall: 70, rainStd: 18 },
    sesame: { N: 40, Nstd: 8, P: 28, Pstd: 6, K: 25, Kstd: 5, temp: 30, tempStd: 3, humidity: 55, humStd: 8, ph: 6.2, phStd: 0.5, rainfall: 55, rainStd: 12 },

    // CASH CROPS
    sugarcane: { N: 100, Nstd: 15, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 30, tempStd: 3, humidity: 75, humStd: 6, ph: 6.8, phStd: 0.5, rainfall: 200, rainStd: 35 },
    tobacco: { N: 50, Nstd: 8, P: 40, Pstd: 7, K: 70, Kstd: 8, temp: 25, tempStd: 3, humidity: 60, humStd: 7, ph: 6.0, phStd: 0.4, rainfall: 80, rainStd: 15 },

    // VEGETABLES
    tomato: { N: 100, Nstd: 15, P: 70, Pstd: 8, K: 70, Kstd: 10, temp: 25, tempStd: 3, humidity: 65, humStd: 8, ph: 6.5, phStd: 0.4, rainfall: 75, rainStd: 18 },
    potato: { N: 70, Nstd: 10, P: 70, Pstd: 8, K: 100, Kstd: 15, temp: 18, tempStd: 2, humidity: 75, humStd: 6, ph: 5.8, phStd: 0.5, rainfall: 75, rainStd: 15 },
    onion: { N: 70, Nstd: 10, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 20, tempStd: 3, humidity: 65, humStd: 6, ph: 6.5, phStd: 0.4, rainfall: 80, rainStd: 15 },
    brinjal: { N: 90, Nstd: 10, P: 60, Pstd: 8, K: 60, Kstd: 8, temp: 28, tempStd: 3, humidity: 70, humStd: 7, ph: 6.0, phStd: 0.4, rainfall: 65, rainStd: 12 },
    okra: { N: 70, Nstd: 10, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 28, tempStd: 3, humidity: 70, humStd: 7, ph: 6.5, phStd: 0.4, rainfall: 70, rainStd: 15 },
    cauliflower: { N: 90, Nstd: 10, P: 60, Pstd: 8, K: 50, Kstd: 8, temp: 18, tempStd: 2, humidity: 65, humStd: 6, ph: 6.5, phStd: 0.4, rainfall: 65, rainStd: 12 },
    cabbage: { N: 90, Nstd: 10, P: 55, Pstd: 8, K: 48, Kstd: 7, temp: 18, tempStd: 2, humidity: 65, humStd: 6, ph: 6.5, phStd: 0.4, rainfall: 65, rainStd: 12 },
    spinach: { N: 70, Nstd: 10, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 18, tempStd: 2, humidity: 65, humStd: 6, ph: 7.0, phStd: 0.4, rainfall: 55, rainStd: 10 },
    carrot: { N: 50, Nstd: 8, P: 50, Pstd: 8, K: 70, Kstd: 8, temp: 18, tempStd: 2, humidity: 65, humStd: 6, ph: 6.5, phStd: 0.4, rainfall: 65, rainStd: 12 },
    peas: { N: 25, Nstd: 5, P: 60, Pstd: 8, K: 50, Kstd: 8, temp: 16, tempStd: 2, humidity: 65, humStd: 6, ph: 6.8, phStd: 0.5, rainfall: 65, rainStd: 12 },
    cucumber: { N: 70, Nstd: 10, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 26, tempStd: 3, humidity: 70, humStd: 7, ph: 6.5, phStd: 0.4, rainfall: 65, rainStd: 12 },
    chilli: { N: 100, Nstd: 15, P: 60, Pstd: 8, K: 60, Kstd: 8, temp: 28, tempStd: 3, humidity: 65, humStd: 8, ph: 6.5, phStd: 0.4, rainfall: 75, rainStd: 18 },
    garlic: { N: 60, Nstd: 8, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 16, tempStd: 2, humidity: 65, humStd: 6, ph: 6.5, phStd: 0.4, rainfall: 55, rainStd: 10 },

    // SPICES
    ginger: { N: 70, Nstd: 8, P: 50, Pstd: 8, K: 50, Kstd: 8, temp: 25, tempStd: 3, humidity: 78, humStd: 5, ph: 6.0, phStd: 0.4, rainfall: 200, rainStd: 30 },
    turmeric: { N: 70, Nstd: 8, P: 40, Pstd: 7, K: 70, Kstd: 8, temp: 25, tempStd: 3, humidity: 78, humStd: 5, ph: 6.2, phStd: 0.5, rainfall: 200, rainStd: 30 },

    // FRUITS
    guava: { N: 50, Nstd: 10, P: 40, Pstd: 8, K: 50, Kstd: 8, temp: 27, tempStd: 3, humidity: 60, humStd: 8, ph: 6.2, phStd: 0.5, rainfall: 110, rainStd: 25 },
    lychee: { N: 50, Nstd: 10, P: 40, Pstd: 8, K: 50, Kstd: 8, temp: 30, tempStd: 3, humidity: 78, humStd: 5, ph: 5.8, phStd: 0.5, rainfall: 160, rainStd: 25 },
    sapota: { N: 50, Nstd: 10, P: 40, Pstd: 8, K: 50, Kstd: 8, temp: 28, tempStd: 3, humidity: 65, humStd: 7, ph: 7.0, phStd: 0.6, rainfall: 110, rainStd: 25 },
};

// Generate all rows
let allNewRows = [];
for (const [crop, params] of Object.entries(newCrops)) {
    const rows = generateSamples(crop, params);
    allNewRows = allNewRows.concat(rows);
    console.log(`Generated 100 samples for: ${crop}`);
}

// Append to crop_recommendation.csv
const csvPath = path.join(__dirname, '..', 'ML FAST API', 'Data', 'crop_recommendation.csv');
const newData = '\n' + allNewRows.join('\n') + '\n';
fs.appendFileSync(csvPath, newData);
console.log(`\nAppended ${allNewRows.length} new rows to crop_recommendation.csv`);
console.log(`Total crops now: ${22 + Object.keys(newCrops).length}`);
