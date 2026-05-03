import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, Users, MapPin, MessageCircle, TrendingUp,
  Leaf, Sprout, Bug, Phone, ArrowRight, BarChart3,
  CheckCircle, Loader2, Star, Wheat
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_FARMERS = [
  { _id: 'f1', fullName: 'Ramji Patel', phone: '9876543210', farmerId: 'IN.GU.RJ-000001', district: 'Rajkot', profile: { cropsGrown: ['Groundnut', 'Cotton'], farmSize: 8.3, completionPercentage: 75 } },
  { _id: 'f2', fullName: 'Kana Parmar', phone: '9812345678', farmerId: 'IN.GU.RJ-000002', district: 'Rajkot', profile: { cropsGrown: ['Wheat', 'Cumin'], farmSize: 5.1, completionPercentage: 60 } },
  { _id: 'f3', fullName: 'Bharat Solanki', phone: '9988776655', farmerId: 'IN.GU.RJ-000003', district: 'Rajkot', profile: { cropsGrown: ['Cotton'], farmSize: 12.0, completionPercentage: 45 } },
  { _id: 'f4', fullName: 'Harsha Makwana', phone: '9001122334', farmerId: 'IN.GU.RJ-000004', district: 'Rajkot', profile: { cropsGrown: ['Groundnut', 'Sesame'], farmSize: 3.5, completionPercentage: 80 } },
];

export default function ExpertDashboard() {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ farmersInDistrict: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/experts/dashboard');
        setStats(data.stats || {});
        const farmersRes = await api.get('/experts/district-farmers');
        setFarmers(farmersRes.data.length > 0 ? farmersRes.data : SAMPLE_FARMERS);
      } catch {
        setFarmers(SAMPLE_FARMERS);
        setStats({ farmersInDistrict: SAMPLE_FARMERS.length });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-700 via-primary-700 to-emerald-800 rounded-3xl p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-white mb-1">Expert Dashboard</h1>
            <p className="text-green-200">Welcome back, <strong>{user?.fullName || 'Expert'}</strong> 👋</p>
            <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/15 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {user?.district || 'Your District'}
              </span>
              <span className="px-3 py-1 bg-white/15 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> {user?.phone}
              </span>
              <span className="px-3 py-1 bg-emerald-400/30 text-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Agricultural Expert
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Farmers in District', value: farmers.length || stats.farmersInDistrict, icon: Users, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Crops Monitored', value: [...new Set(farmers.flatMap(f => f.profile?.cropsGrown || []))].length, icon: Wheat, bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Consultations', value: '—', icon: MessageCircle, bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Avg Farm Size', value: farmers.length ? `${(farmers.reduce((s, f) => s + (f.profile?.farmSize || 0), 0) / farmers.length).toFixed(1)} ac` : '—', icon: Sprout, bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/chat', icon: MessageCircle, label: 'Consultation Chat', desc: 'Chat with farmers in your district', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { to: '/expert/farmers', icon: Users, label: 'Farmer Directory', desc: 'View all farmers under your district', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { to: '/disease-detect', icon: Bug, label: 'Disease Detection', desc: 'Analyze crop disease reports', color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ to, icon: Icon, label, desc, color, bg }) => (
          <Link key={to} to={to}>
            <motion.div whileHover={{ y: -3 }}
              className={`group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer`}>
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Farmers List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" /> Farmers in Your District
          </h2>
          <Link to="/expert/farmers" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farmers.slice(0, 6).map((farmer, i) => (
              <motion.div key={farmer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">{farmer.fullName?.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{farmer.fullName}</h3>
                      <p className="text-xs font-mono text-primary-600 dark:text-primary-400">{farmer.farmerId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-400">{farmer.profile?.farmSize || 0} acres</p>
                    <div className="text-xs text-gray-400 mt-0.5">{farmer.profile?.completionPercentage || 0}% profile</div>
                  </div>
                </div>

                {farmer.profile?.cropsGrown?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {farmer.profile.cropsGrown.map(crop => (
                      <span key={crop} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg">
                        {crop}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link to="/chat"
                    className="flex-1 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary-100 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </Link>
                  <div className="flex-1 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {farmer.phone}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
