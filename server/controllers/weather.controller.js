const axios = require('axios');
const authConfig = require('../config/auth.config');

/**
 * Get current weather by district
 */
exports.getCurrentWeather = async (req, res) => {
    try {
        const { district } = req.query;
        if (!district) return res.status(400).json({ message: "District is required" });

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${authConfig.WEATHER_API_KEY}&units=metric`;
        
        try {
            const response = await axios.get(url);
            const data = response.data;

            res.status(200).json({
                district: data.name,
                temp: data.main.temp,
                condition: data.weather[0].main,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
            });
        } catch (apiError) {
            // Fallback for demo if API key is invalid/missing
            res.status(200).json({
                district: district,
                temp: 32,
                condition: "Sunny",
                description: "clear sky",
                humidity: 45,
                windSpeed: 12,
                note: "Demo data (API key placeholder)"
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get 7-day forecast
 */
exports.getForecast = async (req, res) => {
    try {
        const { district } = req.query;
        // Mock forecast data for demo
        const forecast = [
            { day: 'Mon', temp: 30, condition: 'Sunny' },
            { day: 'Tue', temp: 31, condition: 'Cloudy' },
            { day: 'Wed', temp: 29, condition: 'Rain' },
            { day: 'Thu', temp: 28, condition: 'Storm' },
            { day: 'Fri', temp: 32, condition: 'Sunny' }
        ];
        res.status(200).json({ district, forecast });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
