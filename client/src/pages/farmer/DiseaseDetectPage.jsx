import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { Bug, Upload, X, Loader2, ShieldCheck, AlertTriangle, Leaf, Activity, Droplets, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CROP_OPTIONS = [
  'Apple', 'Blueberry', 'Cherry', 'Corn', 'Grape', 'Orange', 'Peach', 'Pepper',
  'Potato', 'Raspberry', 'Soybean', 'Squash', 'Strawberry', 'Tomato',
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Mango', 'Banana', 'Chilli',
  'Onion', 'Groundnut', 'Coconut', 'Tea', 'Coffee', 'Mustard', 'Cucumber',
  'Brinjal', 'Guava', 'Papaya', 'Lemon', 'Cauliflower', 'Cabbage'
];

export default function DiseaseDetectPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  }, []);

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  const analyze = async () => {
    if (!file) return toast.error('Upload an image first');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (selectedCrop) fd.append('crop', selectedCrop);
      const { data } = await api.post('/smart/disease-detect', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.Disease) {
        // Use Treatment object from Gemini Vision if available, otherwise parse from suggestion string
        const treatment = data.Treatment || {};
        const sug = data.Sugession || '';
        setResult({
          disease: data.Disease,
          crop: data.Crop,
          confidence: `${data.Confidence}%`,
          cause: data.Cause,
          severity: data.Severity,
          severityColor: data.SeverityColor,
          healthScore: data.HealthScore,
          suggestion: sug,
          modelUsed: data.modelUsed || 'AI',
          colorAnalysis: data.ColorAnalysis,
          alternatives: data.AlternativeDiagnosis,
          report: data.Report,
          treatment: {
            chemical: treatment.chemical || sug.split('TREATMENT:')[1]?.split('\n')[0] || 'Consult your nearest KVK for treatment.',
            organic: treatment.organic || sug.split('ORGANIC:')[1]?.split('\n')[0] || 'Neem oil 5ml/L spray as organic alternative.',
            prevention: treatment.prevention || sug.split('PREVENTION:')[1]?.split('TREATMENT')[0] || 'Rotate crops. Maintain spacing. Remove debris.'
          }
        });
      } else if (data.result) {
        setResult(data.result);
      }
      toast.success('Analysis complete!');
    } catch { toast.error('Analysis failed — try again'); } finally { setLoading(false); }
  };

  const getSeverityBadge = (severity) => {
    const map = { 'Mild': 'bg-green-100 text-green-700', 'Moderate': 'bg-amber-100 text-amber-700', 'Severe': 'bg-red-100 text-red-700' };
    return map[severity] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><Bug className="w-6 h-6 text-red-600" /></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Disease Detection</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">AI-powered plant disease identification across 30+ crops</p>
        </div>
      </div>

      {/* Crop Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Crop (optional — improves accuracy)</label>
        <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
          <option value="">Auto-detect crop</option>
          {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Upload Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        className={`relative rounded-2xl border-2 border-dashed transition-all p-10 text-center cursor-pointer
          ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'}
          ${preview ? 'p-4' : 'py-20'}`}
        onClick={() => !preview && document.getElementById('fileInput').click()}
      >
        <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Crop preview" className="max-h-72 mx-auto rounded-xl object-contain" />
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Drag & drop a crop leaf image here</p>
            <p className="text-sm text-gray-400">or click to browse (JPG, PNG, WebP)</p>
          </div>
        )}
      </motion.div>

      {preview && !result && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={analyze} disabled={loading}
          className="mt-6 w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Bug className="w-5 h-5" /> Analyze Image</>}
        </motion.button>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Main Result Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{result.disease}</h3>
                    {result.crop && <p className="text-sm text-gray-500">Crop: {result.crop}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    Confidence: {result.confidence}
                  </span>
                  {result.severity && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(result.severity)}`}>
                      {result.severity}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{result.cause}</p>

              {/* Color Analysis Bar */}
              {result.colorAnalysis && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" /> Image Color Analysis
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Healthy (Green)', value: result.colorAnalysis.GreenRatio, color: 'bg-green-500' },
                      { label: 'Damaged (Brown)', value: result.colorAnalysis.BrownRatio, color: 'bg-amber-700' },
                      { label: 'Stressed (Yellow)', value: result.colorAnalysis.YellowRatio, color: 'bg-yellow-500' },
                      { label: 'Dark Spots', value: result.colorAnalysis.DarkSpots, color: 'bg-gray-800' },
                    ].map((c, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{c.label}</span>
                          <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{c.value}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(c.value, 100)}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                            className={`h-full rounded-full ${c.color}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Chemical Treatment', text: result.treatment?.chemical, icon: ShieldCheck, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200/50 dark:border-blue-800/30', title: 'text-blue-700 dark:text-blue-300' },
                  { label: 'Organic Solution', text: result.treatment?.organic, icon: Leaf, bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200/50 dark:border-green-800/30', title: 'text-green-700 dark:text-green-300' },
                  { label: 'Prevention', text: result.treatment?.prevention, icon: Activity, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200/50 dark:border-amber-800/30', title: 'text-amber-700 dark:text-amber-300' },
                ].map((t, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                    className={`${t.bg} rounded-xl p-4 border ${t.border}`}>
                    <p className={`text-sm font-semibold ${t.title} mb-1 flex items-center gap-1.5`}>
                      <t.icon className="w-4 h-4" /> {t.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Alternative Diagnoses */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Other Possibilities
                </h4>
                <div className="space-y-2">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{alt.Disease}</span>
                      <span className="text-xs font-mono font-bold text-gray-400">{alt.Confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
