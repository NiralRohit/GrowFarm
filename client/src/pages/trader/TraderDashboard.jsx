import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { 
  ShoppingBag, Users, TrendingUp, BarChart3, 
  MapPin, Package, Clock, CheckCircle2, X 
} from 'lucide-react';
import toast from 'react-hot-toast';

function NewQuotationModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    crop: '',
    quantity: '',
    location: '',
    price: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Quotation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
          setFormData({ crop: '', quantity: '', location: '', price: '' });
          onClose();
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crop</label>
            <input required type="text" value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" placeholder="e.g. Wheat" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
            <input required type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" placeholder="e.g. 10 Tons" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" placeholder="e.g. Rajkot" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offer Price</label>
            <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500" placeholder="e.g. ₹2,100" />
          </div>
          <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold mt-6 hover:bg-primary-700">Submit Quotation</button>
        </form>
      </motion.div>
    </div>
  );
}

function MarketAnalysisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg border border-gray-100 dark:border-gray-800 shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Market Analysis Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl">
            <h4 className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Wheat</h4>
            <p className="text-sm mt-1">Prices up by 4.2% in Rajkot due to export demand. Expected to stabilize next week.</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
            <h4 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Groundnut</h4>
            <p className="text-sm mt-1">Prices down 1.5% across Saurashtra APMCs on arrival of fresh harvest.</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl">
            <h4 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Cotton</h4>
            <p className="text-sm mt-1">Steady prices. High volume trading observed in Amreli yard.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TraderDashboard() {
  const [stats, setStats] = useState({ activeBids: 0, completedDeals: 0, reachableFarmers: 0, totalVolume: 0 });
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [showAllBids, setShowAllBids] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setStats({
          activeBids: 12,
          completedDeals: 156,
          reachableFarmers: 840,
          totalVolume: '2,450 Tons'
        });
        
        setRecentBids([
          { id: 'BID-001', crop: 'Cotton', quantity: '5 Tons', location: 'Rajkot', status: 'Active', price: '₹7,200', date: '2024-03-20' },
          { id: 'BID-002', crop: 'Groundnut', quantity: '2 Tons', location: 'Amreli', status: 'Pending', price: '₹6,400', date: '2024-03-19' },
          { id: 'BID-003', crop: 'Wheat', quantity: '10 Tons', location: 'Junagadh', status: 'Completed', price: '₹2,100', date: '2024-03-15' },
        ]);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddQuotation = (data) => {
    const newBid = {
      id: `BID-00${recentBids.length + 1}`,
      ...data,
      status: 'Active',
      date: new Date().toISOString().split('T')[0]
    };
    setRecentBids([newBid, ...recentBids]);
    setStats(prev => ({ ...prev, activeBids: prev.activeBids + 1 }));
    toast.success('Quotation created successfully!');
  };

  const handleConnectApmc = (yard) => {
    toast.success(`Synced with ${yard} successfully!`);
  };

  const displayedBids = showAllBids ? recentBids : recentBids.slice(0, 3);

  const kpis = [
    { label: 'Active Quotations', value: stats.activeBids, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Farmers Reached', value: stats.reachableFarmers, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Trade Volume', value: stats.totalVolume, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Completed Deals', value: stats.completedDeals, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trader Portal</h1>
          <p className="text-gray-500 mt-1">Manage your procurement and connect with local farmers</p>
        </div>
        <button 
          onClick={() => setIsQuotationModalOpen(true)}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" /> New Quotation
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bids Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Procurement Offers</h3>
            <button 
              onClick={() => setShowAllBids(!showAllBids)}
              className="text-sm text-primary-600 font-bold hover:underline"
            >
              {showAllBids ? 'View Less' : 'View All'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-left">
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Crop</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Qty</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase">Location</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase text-right">Offer Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {displayedBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => toast('Offer selected: ' + bid.crop)}>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{bid.crop}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-600 dark:text-gray-400">{bid.quantity}</td>
                    <td className="px-8 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {bid.location}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-bold">
                        {bid.price}
                      </span>
                    </td>
                  </tr>
                ))}
                {displayedBids.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-8 text-center text-gray-500">No procurement offers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Market Trends */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Market Pulse</h4>
              <p className="text-gray-400 text-sm mb-6">Price of Wheat in Rajkot Mandi increased by 4.2% today.</p>
              <button 
                onClick={() => setIsMarketModalOpen(true)}
                className="w-full py-3 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" /> Market Analysis
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full -mr-10 -mt-10"></div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Connected APMCs</h4>
            <div className="space-y-4">
              {['Rajkot Main Mandi', 'Amreli Yard', 'Gondal APMC'].map((yard) => (
                <div 
                  key={yard} 
                  onClick={() => handleConnectApmc(yard)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-sm font-semibold">{yard}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isQuotationModalOpen && (
          <NewQuotationModal 
            isOpen={isQuotationModalOpen} 
            onClose={() => setIsQuotationModalOpen(false)} 
            onSubmit={handleAddQuotation} 
          />
        )}
        {isMarketModalOpen && (
          <MarketAnalysisModal 
            isOpen={isMarketModalOpen} 
            onClose={() => setIsMarketModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}

