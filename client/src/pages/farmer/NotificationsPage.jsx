import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import {
  Bell, AlertTriangle, CloudRain, FileText, Gift, Info,
  CheckCircle, Clock, ChevronRight, Megaphone, Shield, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      // Map icons based on keywords if type is not provided by backend
      const mapped = data.map(n => {
        let type = n.type || 'scheme';
        const content = n.content.toLowerCase();
        if (content.includes('rain') || content.includes('weather') || content.includes('heatwave')) type = 'weather';
        else if (content.includes('bill') || content.includes('apmc')) type = 'billing';
        else if (content.includes('insurance') || content.includes('pmfby')) type = 'insurance';
        else if (content.includes('subsidy') || content.includes('credited')) type = 'subsidy';
        else if (content.includes('advisory') || content.includes('expert')) type = 'advisory';
        return { ...n, type };
      });
      setNotifications(mapped);
    } catch (err) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post('/seed/demo-data');
      toast.success('Demo data seeded! 🚀');
      fetchData();
    } catch (err) {
      toast.error('Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const filterMap = { 'All': null, 'Weather': 'weather', 'Schemes': 'scheme', 'Subsidies': 'subsidy', 'Insurance': 'insurance', 'Advisory': 'advisory' };
  const filtered = activeFilter === 'All' ? notifications : notifications.filter(n => n.type === filterMap[activeFilter]);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (isNaN(mins)) return 'Just now';
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const typeConfig = {
    weather: { icon: CloudRain, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', border: 'border-l-red-500' },
    scheme: { icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', border: 'border-l-blue-500' },
    subsidy: { icon: Gift, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', border: 'border-l-green-500' },
    insurance: { icon: Shield, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', border: 'border-l-sky-500' },
    advisory: { icon: Info, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', border: 'border-l-amber-500' },
    billing: { icon: Megaphone, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', border: 'border-l-purple-500' },
  };

  const FILTER_TABS = ['All', 'Weather', 'Schemes', 'Subsidies', 'Insurance', 'Advisory'];

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Alerts & Notifications 📢</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:block hidden">Weather alerts, scheme updates & important notifications</p>
          </div>
        </div>

        {notifications.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-600/20 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            Seed Data
          </motion.button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6 overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif, i) => {
          const config = typeConfig[notif.type] || typeConfig.scheme;
          const TypeIcon = config.icon;

          return (
            <motion.div key={notif._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 ${config.border} hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${config.color}`}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{notif.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 font-semibold">{notif.from}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(notif.time)}</span>
                    {notif.priority === 'high' && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full uppercase">Urgent</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications in this category</p>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
