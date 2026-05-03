import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { CloudSun, Droplets, Wind, Thermometer, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WeatherPage() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const district = user?.district || 'Ahmedabad';

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const [cur, fore] = await Promise.all([
          api.get(`/weather/current?district=${district}`),
          api.get(`/weather/forecast?district=${district}`),
        ]);
        setWeather(cur.data);
        setForecast(fore.data.forecast || []);
      } catch {} finally { setLoading(false); }
    };
    fetchWeather();
  }, [district]);

  const conditionIcon = (c) => {
    const lower = (c || '').toLowerCase();
    if (lower.includes('rain') || lower.includes('storm')) return '🌧️';
    if (lower.includes('cloud')) return '☁️';
    if (lower.includes('sun') || lower.includes('clear')) return '☀️';
    return '🌤️';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
    </div>
  );

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><CloudSun className="w-6 h-6 text-blue-600" /></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Weather Forecast</h1>
          <p className="text-gray-500 text-sm">{district} District, Gujarat</p>
        </div>
      </div>

      {/* Current Weather Hero */}
      {weather && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left flex-1">
              <p className="text-blue-200 text-sm font-medium mb-1">{weather.district || district}</p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <span className="text-7xl">{conditionIcon(weather.condition)}</span>
                <div>
                  <div className="text-6xl font-bold">{weather.temp}°</div>
                  <p className="text-blue-200 capitalize">{weather.description || weather.condition}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
                { icon: Thermometer, label: 'Feels Like', value: `${weather.temp}°C` },
                { icon: Eye, label: 'Visibility', value: 'Good' },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 mx-auto text-blue-200 mb-1" />
                  <p className="text-xs text-blue-200">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 7-Day Forecast (horizontal scroll) */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">5-Day Forecast</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {forecast.map((day, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
            className="min-w-[140px] bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card border border-gray-100 dark:border-gray-800 text-center shrink-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{day.day}</p>
            <div className="text-3xl my-3">{conditionIcon(day.condition)}</div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{day.temp}°C</p>
            <p className="text-xs text-gray-400 capitalize">{day.condition}</p>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
}
