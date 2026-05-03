import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { Sprout, Zap, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CropRecommendPage() {
  const [form, setForm] = useState({ N: 50, P: 50, K: 50, temp: 25, humidity: 70, ph: 6.5, rainfall: 100 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const fields = [
    { key: 'N', label: 'Nitrogen (N)', min: 0, max: 140, unit: 'kg/ha', color: 'text-green-600' },
    { key: 'P', label: 'Phosphorus (P)', min: 0, max: 140, unit: 'kg/ha', color: 'text-blue-600' },
    { key: 'K', label: 'Potassium (K)', min: 0, max: 200, unit: 'kg/ha', color: 'text-purple-600' },
    { key: 'temp', label: 'Temperature', min: 5, max: 50, unit: '°C', color: 'text-orange-600' },
    { key: 'humidity', label: 'Humidity', min: 10, max: 100, unit: '%', color: 'text-cyan-600' },
    { key: 'ph', label: 'Soil pH', min: 3, max: 10, unit: '', color: 'text-amber-600', step: 0.1 },
    { key: 'rainfall', label: 'Rainfall', min: 10, max: 400, unit: 'mm', color: 'text-blue-500' },
  ];

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/smart/crop-recommend', form);
      setResults(data.recommendations);
    } catch (err) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl"><Sprout className="w-6 h-6 text-green-600" /></div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Crop Recommendation</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Adjust your soil parameters and get AI-powered crop suggestions</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {fields.map(({ key, label, min, max, unit, color, step }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <span className={`text-sm font-bold ${color}`}>{form[key]} {unit}</span>
              </div>
              <input type="range" min={min} max={max} step={step || 1} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>{min}</span><span>{max}</span>
              </div>
            </div>
          ))}
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRecommend} disabled={loading}
          className="mt-8 w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-700 to-primary-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 disabled:opacity-60 mx-auto">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Recommend Crops <ArrowRight className="w-4 h-4" /></>}
        </motion.button>
      </div>

      {/* Results */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-8">
          {results.map((crop, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8 items-stretch">
              
              {/* Crop Profile Info */}
              <div className="flex-1 md:max-w-xs text-center md:text-left flex flex-col items-center md:items-start justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-6 md:pb-0 md:pr-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{medals[i]}</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{crop.crop}</h3>
                </div>
                
                <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-md">
                  <img 
                    src={`/crop_image/${crop.crop.toLowerCase().replace(/\s+/g, '')}.jpg`} 
                    alt={crop.crop}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = '/Logo.svg'; 
                      e.target.className = 'w-full h-full object-contain p-4 bg-gray-50 dark:bg-gray-800';
                    }}
                  />
                </div>
                
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  crop.suitability === 'High' ? 'bg-green-100 text-green-700' :
                  crop.suitability === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>{crop.suitability} Suitability</div>
                
                <div className="w-full mt-2 text-left">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${crop.confidence}%` }} transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{crop.confidence}% confidence match</p>
                </div>
              </div>

              {/* Data & Chart Section */}
              <div className="flex-[2] flex flex-col gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary-500" /> Soil Nutrition vs Ideal Profile
                  </h4>
                  <div className="h-48 w-full bg-gray-50 dark:bg-gray-800/30 rounded-xl p-2 border border-gray-100 dark:border-gray-800/50">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Nitrogen', User: form.N, Ideal: crop.profile?.N || 0 }, 
                        { name: 'Phosphorus', User: form.P, Ideal: crop.profile?.P || 0 }, 
                        { name: 'Potassium', User: form.K, Ideal: crop.profile?.K || 0 }
                      ]} margin={{top: 15, right: 15, left: -20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{fill: 'transparent'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                        <Bar dataKey="User" fill="#9ca3af" radius={[4, 4, 0, 0]} barSize={30} />
                        <Bar dataKey="Ideal" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-500" /> Care & Yield Instructions
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-200 p-4 rounded-xl text-sm leading-relaxed border border-green-100 dark:border-green-800/30 shadow-inner">
                    <p>{crop.care || 'Regular watering, crop rotation, and periodic fertilization monitoring are required for a bountiful yield.'}</p>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatedPage>
  );
}
