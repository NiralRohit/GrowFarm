const cron = require('node-cron');
const axios = require('axios');
const authConfig = require('../config/auth.config');
const User = require('../models/User.model');

/**
 * Weather monitoring cron job
 * Runs every 3 hours: 0 *\/3 * * *
 */
const startWeatherCron = () => {
  cron.schedule('0 */3 * * *', async () => {
    console.log('--- Running Weather Alert Check ---');
    try {
      const users = await User.find({ role: 'farmer', isVerified: true }).distinct('district');
      
      for (const district of users) {
        if (!district) continue;
        
        try {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${authConfig.WEATHER_API_KEY}&units=metric`;
          const response = await axios.get(url);
          const { main, weather } = response.data;

          // Thresholds for alerts
          let alertMsg = null;
          if (main.temp > 40) alertMsg = `Heatwave alert in ${district}! Stay hydrated and protect your crops.`;
          if (weather[0].main.toLowerCase() === 'storm' || weather[0].main.toLowerCase() === 'extreme') {
            alertMsg = `Extreme weather alert for ${district}! Secure your farm equipment.`;
          }

          if (alertMsg) {
            console.log(`[ALERT] ${alertMsg}`);
            // In real app: Send SMS via Twilio or FCM Push
          }
        } catch (err) {
          // Silent fail for individual district lookup
        }
      }
    } catch (error) {
      console.error('Weather cron failed:', error);
    }
  });
};

module.exports = { startWeatherCron };
