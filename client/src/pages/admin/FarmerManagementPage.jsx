import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { Search, Loader2, User, Trash2, MapPin, Phone, Calendar, Filter } from 'lucide-react';
import { ManagementSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function FarmerManagementPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/all-farmers');
        setFarmers(data);
      } catch (err) {
        toast.error('Failed to load farmers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farmer? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/farmers/${id}`);
      setFarmers(farmers.filter(f => f._id !== id));
      toast.success('Farmer deleted');
    } catch {
      toast.error('Deletion failed');
    }
  };

  const filtered = farmers.filter(f => {
    const matchesSearch = (f.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (f.phone || '').includes(search) || 
                          (f.farmerId || '').toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = districtFilter === 'All' || f.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const districts = ['All', ...new Set(farmers.map(f => f.district).filter(Boolean))];

  if (loading) return <AnimatedPage className="max-w-7xl mx-auto px-4 py-10"><ManagementSkeleton /></AnimatedPage>;

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Farmer Management</h1>
          <p className="text-sm text-gray-500">Manage all registered farmers from here</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Name, ID, or Phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 text-sm w-full md:w-64"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
            <Filter className="w-4 h-4" />
            <select 
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((farmer, i) => (
                <motion.tr 
                  key={farmer._id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{farmer.fullName || 'No Name'}</div>
                        <div className="text-xs font-mono text-primary-600">{farmer.farmerId || 'PENDING'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {farmer.district}, {farmer.taluka}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                      {farmer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(farmer._id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-sm">
                    No farmers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
}
