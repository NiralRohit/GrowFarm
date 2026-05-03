/**
 * GrowFarm Smart AI Assistant — Enhanced Edition
 * Powered by Google Gemini 2.0 Flash
 */
const { GoogleGenAI } = require('@google/genai');
const ChatHistory = require('../models/ChatHistory.model');
const Profile = require('../models/Profile.model');
const axios = require('axios');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });

// Current month for seasonal advice
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SYSTEM_PROMPT = `You are "GrowFarm AI", an expert agricultural assistant for Indian farmers, specializing in Gujarat farming. You are knowledgeable, warm, and practical. Current date: ${new Date().toLocaleDateString('en-IN')}. Current month: ${MONTHS[new Date().getMonth()]}.

CORE EXPERTISE:
- Crop guides: Rice, Wheat, Cotton, Groundnut, Tomato, Sugarcane, Mango, Banana, Maize, Mustard, Soybean, Bajra, Jowar, Cumin, Fennel, Castor, Tobacco, Onion, Potato, Garlic, Chilli, Turmeric, Ginger, Coriander, Fenugreek, and all Indian crops
- Disease ID & treatment (mention they can upload a photo in Disease Detection section)
- Soil health, NPK, organic farming (ZBNF, Jeevamrit, Beejamrit, Panchagavya, Vermicompost)
- Irrigation: Drip, Sprinkler, Flood, Rainwater harvesting
- Government schemes: PM-KISAN (₹6000/yr), PMFBY (crop insurance), KCC (4% interest), PM-KUSUM (solar pumps), PMKSY, e-NAM, Soil Health Card, RKVY, NMSA
- Gujarat schemes: Krishi Mahotsav, GGRC subsidies, Kisan Parivahan Yojana, iKhedut portal
- MSP 2024-25: Wheat ₹2275/q, Paddy ₹2300/q, Cotton ₹7121/q, Groundnut ₹6377/q, Mustard ₹5650/q, Bajra ₹2500/q, Jowar ₹3180/q, Maize ₹2090/q, Soybean ₹4892/q, Sugarcane ₹315/q
- Pest management (IPM), bio-pesticides, Trichoderma, Pseudomonas
- Weather-based farming, monsoon prep
- APMC prices, e-NAM, FPO selling, value addition
- Livestock: Dairy (Gir cow, Murrah buffalo), Poultry, Goat farming
- Post-harvest: Storage, cold chain, food processing

SEASONAL CALENDAR (Gujarat):
- Kharif (Jun-Oct): Cotton, Groundnut, Rice, Bajra, Castor, Soybean
- Rabi (Nov-Mar): Wheat, Mustard, Cumin, Fennel, Potato, Garlic, Onion, Coriander
- Summer/Zaid (Mar-Jun): Watermelon, Muskmelon, Cucumber, Okra, Sesame

FORMATTING:
- Use **bold** for key terms, crop names, values
- Use bullet points (•) for lists
- Use emojis: 🌾🌱💧🧪⚠️💡🛡️📊🌤️📸
- Keep answers concise but complete
- End with actionable tip or next step
- For disease queries: "📸 Upload a leaf photo in Disease Detection for AI analysis!"
- For schemes: mention which department/portal to contact
- For prices: tell to check agmarknet.gov.in or e-NAM for live rates

LANGUAGE:
- Understand Hindi/Gujarati terms: dhan, gehun, kapas, mungfali, ganna, mati, khad, pani, mausam, kida, rog, bij, ugavni, paak, sinchai
- Reply in user's language (English/Hinglish/Gujarati-English mix)

PLATFORM FEATURES (mention when relevant):
- Crop Recommendation (AI-based, enter soil params)
- Disease Detection (upload photo)
- Weather page (forecasts)
- Government Schemes (browse & apply)
- Smart Farming (yield prediction)
- APMC Billing History

Be encouraging, empathetic, and treat every farmer's problem as important. Give specific, actionable advice with quantities and timings.`;

// Quick replies based on context + season
function generateQuickReplies(text) {
  const lower = text.toLowerCase();
  const month = new Date().getMonth();
  const isKharif = month >= 5 && month <= 9;
  const isRabi = month >= 10 || month <= 2;

  if (lower.includes('rice') || lower.includes('paddy') || lower.includes('dhan'))
    return ['Rice disease symptoms?', 'Best rice fertilizer schedule', 'Rice water management', 'Rice harvest timing'];
  if (lower.includes('wheat') || lower.includes('gehun'))
    return ['Wheat sowing time Gujarat', 'Wheat irrigation schedule', 'Wheat rust control', 'Wheat MSP 2024-25'];
  if (lower.includes('cotton') || lower.includes('kapas'))
    return ['Pink bollworm control', 'BT Cotton spacing', 'Cotton picking tips', 'Cotton MSP rate'];
  if (lower.includes('groundnut') || lower.includes('mungfali'))
    return ['Groundnut varieties Gujarat', 'Tikka disease control', 'Groundnut harvest signs', 'Groundnut MSP'];
  if (lower.includes('scheme') || lower.includes('subsidy') || lower.includes('yojana') || lower.includes('government'))
    return ['PM-KISAN registration', 'PMFBY crop insurance', 'KCC loan apply', 'iKhedut Gujarat portal'];
  if (lower.includes('disease') || lower.includes('rog') || lower.includes('blight') || lower.includes('wilt') || lower.includes('spot'))
    return ['Upload leaf photo 📸', 'Organic disease control', 'Fungicide guide', 'Neem oil usage'];
  if (lower.includes('soil') || lower.includes('mati') || lower.includes('fertilizer') || lower.includes('khad') || lower.includes('npk'))
    return ['Soil testing near me', 'Organic manure guide', 'NPK ratio for crops', 'Vermicompost making'];
  if (lower.includes('weather') || lower.includes('mausam') || lower.includes('rain') || lower.includes('varsa'))
    return ['Monsoon crop protection', 'Drought-resistant crops', 'Irrigation scheduling', 'Weather forecast'];
  if (lower.includes('market') || lower.includes('msp') || lower.includes('price') || lower.includes('sell') || lower.includes('mandi'))
    return ['Current MSP rates', 'e-NAM registration', 'APMC nearest mandi', 'Value addition ideas'];
  if (lower.includes('organic') || lower.includes('jaivik'))
    return ['Jeevamrit recipe', 'Beejamrit preparation', 'ZBNF method', 'Organic certification'];
  if (lower.includes('dairy') || lower.includes('cow') || lower.includes('buffalo') || lower.includes('milk'))
    return ['Gir cow management', 'Cattle feed formula', 'Milk yield increase', 'Dairy loan scheme'];
  if (lower.includes('irrigation') || lower.includes('sinchai') || lower.includes('drip') || lower.includes('water'))
    return ['Drip irrigation subsidy', 'Sprinkler vs drip', 'Water saving tips', 'PM-KUSUM solar pump'];

  // Seasonal defaults
  if (isKharif) return ['Cotton farming guide', 'Monsoon crop tips', 'Groundnut sowing', 'Pest control Kharif'];
  if (isRabi) return ['Wheat growing guide', 'Cumin farming tips', 'Rabi crop planning', 'Mustard cultivation'];
  return ['How to grow Wheat?', 'Government Schemes', 'Soil & Fertilizer Guide', 'Pest Control Tips'];
}

// Fetch weather context for user's location
async function getWeatherContext(city) {
  if (!city) return '';
  try {
    const apiKey = 'b56e6807765bfa742b5c07f6b3f58deb';
    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`, { timeout: 3000 });
    return `\n[CURRENT WEATHER for ${city}: ${data.main.temp}°C, ${data.weather[0].description}, Humidity: ${data.main.humidity}%, Wind: ${data.wind.speed} m/s. Use this to give weather-appropriate farming advice.]`;
  } catch { return ''; }
}

// Build user context from profile
async function getUserContext(userId) {
  try {
    const profile = await Profile.findOne({ user: userId }).lean();
    if (!profile) return '';
    const parts = [];
    if (profile.address?.district) parts.push(`District: ${profile.address.district}`);
    if (profile.address?.village) parts.push(`Village: ${profile.address.village}`);
    if (profile.address?.taluka) parts.push(`Taluka: ${profile.address.taluka}`);
    if (profile.farmSize) parts.push(`Farm: ${profile.farmSize} hectares`);
    if (profile.cropsGrown?.length) parts.push(`Crops: ${profile.cropsGrown.join(', ')}`);
    if (profile.landRecords?.[0]?.soilType) parts.push(`Soil: ${profile.landRecords[0].soilType}`);
    if (parts.length === 0) return '';
    return `\n[FARMER PROFILE: ${parts.join(' | ')}. Personalize advice for this farmer.]`;
  } catch { return ''; }
}

// Comprehensive offline fallback
function offlineFallback(msg) {
  const l = msg.toLowerCase();
  
  // 1. CROP SPECIFIC (Check these first)
  if (l.includes('wheat') || l.includes('gehun') || l.includes('ghau')) return "**🌾 Wheat Guide (Rabi)**\n• **Sowing**: Nov 1-25 (Gujarat)\n• **Seed rate**: 100-125 kg/ha\n• **Varieties**: GW-496, Lok-1, GW-322\n• **Irrigation**: 5-6 times (CRI at 21 days is critical)\n• **Fertilizer**: 120:60:40 NPK kg/ha\n• **MSP 2024-25**: ₹2,275/quintal\n\n💡 Treat seeds with Thiram 2.5g/kg before sowing.";
  
  if (l.includes('rice') || l.includes('dhan') || l.includes('paddy') || l.includes('choka')) return "**🌾 Rice Guide (Kharif)**\n• **Season**: June-July transplanting\n• **Varieties**: GR-11, Jaya, IR-8, Gurjari\n• **Water**: Standing water 5cm for first 3 weeks\n• **Fertilizer**: 100:40:40 NPK kg/ha\n• **MSP 2024-25**: ₹2,300/quintal\n\n💡 Use SRI method to save 40% water.";
  
  if (l.includes('cotton') || l.includes('kapas')) return "**🌿 Cotton Guide (Kharif)**\n• **Sowing**: May-June with monsoon onset\n• **Spacing**: 90×60cm (BT), 120×45cm (Desi)\n• **Fertilizer**: 160:80:80 NPK kg/ha\n• **Pest**: Pink bollworm — use pheromone traps\n• **MSP 2024-25**: ₹7,121/quintal (long staple)\n\n💡 Do not spray insecticide in first 60 days.";
  
  if (l.includes('groundnut') || l.includes('mungfali') || l.includes('sing')) return "**🥜 Groundnut Guide**\n• **Season**: Kharif (Jun-Jul) & Summer (Feb-Mar)\n• **Varieties**: GG-20, TG-37A, GG-7\n• **Seed rate**: 100-120 kg/ha\n• **Fertilizer**: 25:50:0 NPK + Gypsum 500 kg/ha\n• **MSP 2024-25**: ₹6,377/quintal\n\n💡 Apply Gypsum at flowering for better pod filling.";
  
  if (l.includes('maize') || l.includes('makai') || l.includes('makkai')) return "**🌽 Maize (Makai) Guide**\n• **Kharif**: June-July sowing\n• **Rabi**: Oct-Nov sowing\n• **Spacing**: 60×20 cm\n• **Water saving**: Use drip irrigation or ridge-furrow method to save 30% water.\n• **Fertilizer**: 120:60:40 NPK kg/ha\n• **MSP**: ₹2,090/quintal\n\n💡 Avoid water logging; maize needs well-drained soil.";
  
  if (l.includes('tomato') || l.includes('tamatar')) return "**🍅 Tomato Guide**\n• **Spacing**: 60×45cm\n• **Varieties**: Pusa Ruby, Arka Rakshak\n• **Staking**: Essential for better yield\n• **Fertilizer**: 120:60:60 NPK kg/ha\n• **Disease**: Blossom End Rot = Calcium deficiency\n\n💡 Use drip irrigation + mulching for 30% more yield.";
  
  if (l.includes('cumin') || l.includes('jeeru')) return "**🌿 Cumin Guide (Rabi)**\n• **Sowing**: Nov 15-30 (Gujarat)\n• **Seed rate**: 12-15 kg/ha\n• **Varieties**: GC-4, Gujarat Cumin-2\n• **Irrigation**: 4-5 light irrigations\n• **Disease**: Wilt — use Trichoderma treated seeds\n\n💡 Avoid excess water; cumin prefers dry conditions.";
  
  if (l.includes('bajra') || l.includes('millet') || l.includes('pearl')) return "**🌾 Bajra (Pearl Millet) Guide**\n• **Season**: Kharif (Jun-Jul)\n• **Varieties**: GHB-558, GHB-732\n• **Seed rate**: 4-5 kg/ha\n• **Fertilizer**: 80:40:0 NPK kg/ha\n• **MSP**: ₹2,500/quintal\n\n💡 Most drought-tolerant cereal; ideal for dry Gujarat regions.";
  
  if (l.includes('onion') || l.includes('dungri') || l.includes('kanda')) return "**🧅 Onion Guide (Rabi)**\n• **Transplanting**: Dec-Jan (Gujarat)\n• **Varieties**: AFLR, Agrifound Dark Red, Pusa Ratnar\n• **Spacing**: 15×10cm\n• **Fertilizer**: 100:50:50 NPK kg/ha\n• **Storage**: Cure for 10-15 days before storing\n\n💡 Stop irrigation 10 days before harvesting for better storage life.";

  // 2. ISSUES & CATEGORIES
  if (l.includes('disease') || l.includes('rog') || l.includes('spot') || l.includes('blight') || l.includes('pest') || l.includes('kida'))
    return "📸 It sounds like a **Crop Disease or Pest issue**!\n\n• Go to **Disease Detection** section and upload a leaf photo for AI diagnosis\n• Quick remedies: Neem oil (5ml/L) for most pests, Copper Oxychloride for fungal diseases\n• For organic: Try Jeevamrit or Trichoderma\n\n💡 Always identify the disease first before spraying chemicals!";
    
  if (l.includes('scheme') || l.includes('yojana') || l.includes('pm-') || l.includes('kisan') || l.includes('subsidy'))
    return "**🛡️ Key Government Schemes**\n• **PM-KISAN**: ₹6,000/yr in 3 installments → pmkisan.gov.in\n• **PMFBY**: Crop insurance, premium just 2% → pmfby.gov.in\n• **KCC**: Farm loans at 4% effective interest\n• **PM-KUSUM**: Solar pump subsidy up to 90%\n• **iKhedut**: Gujarat schemes portal → ikhedut.gujarat.gov.in\n\n💡 Apply through your nearest CSC center or bank branch.";
    
  if (l.includes('soil') || l.includes('mati') || l.includes('fertilizer') || l.includes('khad') || l.includes('npk'))
    return "**🧪 Soil & Fertilizer Guide**\n• Get soil tested every 2 years at nearest KVK or Soil Testing Lab\n• **Balanced NPK** is key — don't over-use Urea alone\n• **Organic options**: FYM 10 t/ha + Vermicompost 2 t/ha\n• **Micronutrients**: Zinc, Iron, Boron — often deficient in Gujarat soils\n\n💡 Apply fertilizers based on Soil Health Card recommendations.";
    
  if (l.includes('market') || l.includes('mandi') || l.includes('price') || l.includes('sell') || l.includes('msp'))
    return "**📊 Market & Selling Tips**\n• **MSP 2024-25**: Wheat ₹2275, Paddy ₹2300, Cotton ₹7121, Groundnut ₹6377/q\n• Check live APMC prices at agmarknet.gov.in\n• Register on e-NAM for online trading\n• Grade & clean produce for 5-10% better price\n\n💡 Sell through FPO (Farmer Producer Org) for better bargaining power.";
    
  if (l.includes('organic') || l.includes('jaivik') || l.includes('natural'))
    return "**🌱 Organic Farming Guide**\n• **Jeevamrit**: 200L water + 10kg desi cow dung + 10L urine + 2kg jaggery + 2kg pulse flour → ferment 3 days\n• **Beejamrit**: Seed treatment with cow dung + urine + lime\n• **Panchagavya**: 5 cow products fermented\n• **ZBNF**: Zero Budget Natural Farming by Subhash Palekar\n\n💡 Start with 1 acre to learn, then scale up.";
    
  if (l.includes('irrigation') || l.includes('sinchai') || l.includes('drip') || l.includes('water') || l.includes('pani'))
    return "**💧 Irrigation Guide**\n• **Drip**: Best for cotton, vegetables, fruits — saves 40-60% water\n• **Sprinkler**: Good for wheat, groundnut, cumin\n• **Subsidy**: 50-80% under PMKSY for micro-irrigation\n• **Solar pump**: PM-KUSUM — up to 90% subsidy\n\n💡 Apply at ikhedut.gujarat.gov.in for irrigation subsidies.";
    
  if (l.includes('dairy') || l.includes('cow') || l.includes('buffalo') || l.includes('dudh') || l.includes('milk'))
    return "**🐄 Dairy Farming Guide**\n• **Gir Cow**: 12-15 L/day, A2 milk premium price\n• **Murrah Buffalo**: 15-20 L/day\n• **Feed**: 40kg green + 10kg dry + 3kg concentrate/day\n• **Loans**: NABARD dairy scheme, KCC for cattle\n\n💡 Gir cow is Gujarat's pride — A2 milk sells at ₹60-80/L.";
    
  if (l.includes('hello') || l.includes('hi') || l.includes('namaste') || l.includes('kem'))
    return "Namaste! 🌱 I'm **GrowFarm AI** — your farming expert!\n\nI can help with:\n• 🌾 Crop guides & planning\n• 🐛 Disease & pest control\n• 🧪 Soil & fertilizer advice\n• 🛡️ Government schemes\n• 📊 Market prices & MSP\n• 💧 Irrigation techniques\n\nWhat would you like to know? 😊";

  return "I'm in **Offline Mode** 🚜\n\nI can help with:\n• **Crops**: Wheat, Rice, Cotton, Groundnut, Cumin, Tomato, Onion, Bajra, Maize\n• **Issues**: Diseases, Pests, Soil, Fertilizer\n• **Info**: Schemes, MSP, Markets, Organic Farming\n• **Other**: Irrigation, Dairy, Livestock\n\nTry: 'How to grow wheat?' or 'Government schemes'";
}

// ─── Main Handler ─────────────────────────────────
exports.handleMessage = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Empty message' });

    // Build enhanced context
    let contextPrompt = SYSTEM_PROMPT;
    const userId = req.user?._id;

    // Add user context & weather
    const userCtx = await getUserContext(userId);
    contextPrompt += userCtx;
    const distMatch = userCtx.match(/District:\s*([^|,\]]+)/);
    if (distMatch) {
      const weatherCtx = await getWeatherContext(distMatch[1].trim());
      contextPrompt += weatherCtx;
    }

    // Build conversation
    const contents = [];
    for (const msg of history.slice(-20)) { // Last 20 messages for context
      contents.push({
        role: msg.sender === 'User' ? 'user' : 'model',
        parts: [{ text: msg.message }],
      });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Gemini call with model fallback chain
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    let responseText = null;
    let usedModel = 'Offline';

    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          systemInstruction: contextPrompt,
          contents,
          config: { maxOutputTokens: 2048, temperature: 0.7, topP: 0.9 },
        });
        responseText = response.text;
        usedModel = modelName;
        break;
      } catch (modelErr) {
        console.log(`[GrowFarm AI] ${modelName} failed, trying next...`);
        continue;
      }
    }

    if (!responseText) throw new Error('All models exhausted');

    const quickReplies = generateQuickReplies(message + ' ' + responseText);

    // Save to chat history (async, don't wait)
    if (userId) {
      saveChatMessage(userId, message, responseText, quickReplies).catch(e => console.error('[ChatHistory] Save error:', e.message));
    }

    return res.status(200).json({
      sender: 'Bot',
      message: responseText,
      quickReplies,
      timestamp: new Date(),
      model: usedModel,
    });

  } catch (error) {
    console.error('[GrowFarm AI] Error:', (error?.message || '').substring(0, 80));
    return res.status(200).json({
      sender: 'Bot',
      message: offlineFallback(req.body.message || ''),
      quickReplies: generateQuickReplies(req.body.message || ''),
      timestamp: new Date(),
      model: 'GrowFarm Offline AI',
    });
  }
};

// Save messages to DB
async function saveChatMessage(userId, userMsg, botMsg, quickReplies) {
  let session = await ChatHistory.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
  if (!session) {
    session = new ChatHistory({ userId, messages: [] });
  }
  session.messages.push({ sender: 'User', message: userMsg });
  session.messages.push({ sender: 'Bot', message: botMsg, quickReplies });
  // Auto-title from first user message
  if (session.messages.filter(m => m.sender === 'User').length === 1) {
    session.sessionTitle = userMsg.substring(0, 50);
  }
  await session.save();
}

// ─── Get chat history ─────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const session = await ChatHistory.findOne({ userId: req.user._id, isActive: true }).sort({ updatedAt: -1 });
    if (!session) return res.json({ messages: [] });
    return res.json({ messages: session.messages, sessionId: session._id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load history' });
  }
};

// ─── Clear / New chat ─────────────────────────────
exports.clearHistory = async (req, res) => {
  try {
    await ChatHistory.updateMany({ userId: req.user._id, isActive: true }, { isActive: false });
    return res.json({ message: 'Chat cleared' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to clear' });
  }
};

// ─── List past sessions ──────────────────────────
exports.getSessions = async (req, res) => {
  try {
    const sessions = await ChatHistory.find({ userId: req.user._id })
      .select('sessionTitle createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    const result = sessions.map(s => ({
      _id: s._id,
      title: s.sessionTitle,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.message?.substring(0, 80),
      updatedAt: s.updatedAt,
    }));
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load sessions' });
  }
};
