import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { BarChart3, Users, FileText, ShoppingCart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#16a34a', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const [stats, setStats] = useState({ farmers: 0, schemes: 0, bills: 0, applications: 0 });
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats({ farmers: data.farmers, schemes: data.schemes, bills: data.bills, applications: data.applications });
        setDistrictData(data.districtData);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = [
    { label: 'Total Farmers', value: stats.farmers, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Active Schemes', value: stats.schemes, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'APMC Bills', value: stats.bills, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Applications', value: stats.applications, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const cropData = [
    { name: 'Cotton', value: 30 }, { name: 'Wheat', value: 25 },
    { name: 'Rice', value: 20 }, { name: 'Groundnut', value: 15 },
    { name: 'Other', value: 10 },
  ];

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl"><BarChart3 className="w-6 h-6 text-primary-600" /></div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-card border border-gray-100 dark:border-gray-800">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</motion.div>
            <p className="text-sm text-gray-500">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Farmers by District</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} /><Tooltip />
              <Bar dataKey="farmers" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Crops Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={cropData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {cropData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}
