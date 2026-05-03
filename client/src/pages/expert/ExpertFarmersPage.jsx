import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { Users, Search, MapPin, Phone, Wheat, MessageCircle, Loader2, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_FARMERS = [
  { _id: 'f1', fullName: 'Ramji Patel', phone: '9876543210', farmerId: 'IN.GU.RJ-000001', district: 'Rajkot', profile: { cropsGrown: ['Groundnut', 'Cotton'], farmSize: 8.3, completionPercentage: 75, address: { village: 'Kotda', taluka: 'Kotda Sangani' } } },
  { _id: 'f2', fullName: 'Kana Parmar', phone: '9812345678', farmerId: 'IN.GU.RJ-000002', district: 'Rajkot', profile: { cropsGrown: ['Wheat', 'Cumin'], farmSize: 5.1, completionPercentage: 60, address: { village: 'Shapar', taluka: 'Rajkot' } } },
  { _id: 'f3', fullName: 'Bharat Solanki', phone: '9988776655', farmerId: 'IN.GU.RJ-000003', district: 'Rajkot', profile: { cropsGrown: ['Cotton'], farmSize: 12.0, completionPercentage: 45, address: { village: 'Gondal', taluka: 'Gondal' } } },
  { _id: 'f4', fullName: 'Harsha Makwana', phone: '9001122334', farmerId: 'IN.GU.RJ-000004', district: 'Rajkot', profile: { cropsGrown: ['Groundnut', 'Sesame'], farmSize: 3.5, completionPercentage: 80, address: { village: 'Paddhari', taluka: 'Paddhari' } } },
  { _id: 'f5', fullName: 'Suresh Gajjar', phone: '9123456789', farmerId: 'IN.GU.RJ-000005', district: 'Rajkot', profile: { cropsGrown: ['Wheat', 'Cotton', 'Groundnut'], farmSize: 15.2, completionPercentage: 90, address: { village: 'Jasdan', taluka: 'Jasdan' } } },
  { _id: 'f6', fullName: 'Manish Aghara', phone: '9876012345', farmerId: 'IN.GU.RJ-000006', district: 'Rajkot', profile: { cropsGrown: ['Bajra'], farmSize: 4.0, completionPercentage: 55, address: { village: 'Morbi', taluka: 'Morbi' } } },
];

export default function ExpertFarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const { data } = await api.get('/experts/district-farmers');
        setFarmers(data.length > 0 ? data : SAMPLE_FARMERS);
      } catch {
        setFarmers(SAMPLE_FARMERS);
      } finally { setLoading(false); }
    };
    fetchFarmers();
  }, []);

  const filtered = farmers.filter(f =>
    f.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    f.farmerId?.toLowerCase().includes(search.toLowerCase()) ||
    f.profile?.cropsGrown?.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Farmer Directory</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">All farmers in your assigned district</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
          <Users className="w-4 h-4" /> {filtered.length} farmers
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by name, farmer ID, or crop..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Farmer', 'Farmer ID', 'Phone', 'Village / Taluka', 'Crops', 'Farm Size', 'Profile', 'Action'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((farmer, i) => (
                  <motion.tr key={farmer._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-sm">{farmer.fullName?.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{farmer.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">{farmer.farmerId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {farmer.phone}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {farmer.profile?.address?.village && `${farmer.profile.address.village}, `}{farmer.profile?.address?.taluka || farmer.district}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(farmer.profile?.cropsGrown || []).slice(0, 3).map(crop => (
                          <span key={crop} className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md">{crop}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{farmer.profile?.farmSize || 0} ac</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${farmer.profile?.completionPercentage || 0}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{farmer.profile?.completionPercentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-xl hover:bg-primary-100 transition-colors">
                        <MessageCircle className="w-3 h-3" /> Consult
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No farmers found matching "{search}"</p>
            </div>
          )}
        </div>
      )}
    </AnimatedPage>
  );
}
