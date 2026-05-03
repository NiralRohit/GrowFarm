import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Globe, MapPin, FileText, CheckCircle, Search, Loader2,
  Link2, Shield, Landmark, Wheat, Mountain, Info, 
  ChevronDown, Eye, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmInfoPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [landRecords, setLandRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/profile');
        setProfile(data);
        if (data.landRecords && data.landRecords.length > 0) {
          setLandRecords(data.landRecords);
          setVerified(true);
        }
      } catch (err) {
        toast.error('Failed to load farm information');
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleVerifyAadhaar = async () => {
    if (!aadhaarInput || aadhaarInput.length < 12) return toast.error('Please enter a valid 12-digit Aadhaar number');
    setVerifying(true);
    try {
      const { data } = await api.post('/profile/verify-aadhaar', { aadhaarNumber: aadhaarInput });
      if (data.landRecords && data.landRecords.length > 0) {
        setLandRecords(data.landRecords);
        setVerified(true);
        toast.success(data.message || 'Land records updated! 🌍');
      } else {
        toast.error('No land records found for this Aadhaar.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally { setVerifying(false); }
  };

  const totalArea = landRecords.reduce((sum, r) => sum + (r.areaInAcres || 0), 0);

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
          <Globe className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Farm Information 🌍</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aadhaar verification & Record of Rights (ROR) integration</p>
        </div>
      </div>

      {/* Aadhaar Verification Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-primary-200/50 dark:border-primary-800/30 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-bold text-primary-800 dark:text-primary-300">Aadhaar Verification</h2>
          {verified && <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>}
        </div>
        <p className="text-sm text-primary-700 dark:text-primary-400 mb-4">
          Verify your Aadhaar to automatically fetch your farm data from the government's Record of Rights (ROR) system.
        </p>
        <div className="flex gap-3">
          <input type="text" placeholder="Enter 12-digit Aadhaar Number" maxLength={12} value={aadhaarInput}
            onChange={e => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
            className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-primary-200 dark:border-primary-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 font-mono tracking-wider text-gray-900 dark:text-white" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleVerifyAadhaar} disabled={verifying}
            className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl flex items-center gap-2 shrink-0 disabled:opacity-60 shadow-lg shadow-primary-600/20">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Verify & Fetch
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Land', value: `${totalArea.toFixed(1)} Acres`, icon: Mountain, bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Plots', value: landRecords.length, icon: MapPin, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Districts', value: [...new Set(landRecords.map(r => r.district))].length, icon: Globe, bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Farmer ID', value: profile?.farmerId || 'N/A', icon: FileText, bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Land Records (ROR Data) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record of Rights (ROR) — Land Records</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {landRecords.map((record, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedRecord(expandedRecord === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Survey No: {record.surveyNo}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{record.village}, {record.taluka}, {record.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-black text-primary-600 dark:text-primary-400">{record.areaInAcres} Acres</p>
                      <p className="text-xs text-gray-400">{record.soilType}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedRecord === i ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedRecord === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <DetailItem label="Survey Number" value={record.surveyNo} />
                          <DetailItem label="Area" value={`${record.areaInAcres} Acres`} />
                          <DetailItem label="Village" value={record.village} />
                          <DetailItem label="Taluka" value={record.taluka} />
                          <DetailItem label="District" value={record.district} />
                          <DetailItem label="Soil Type" value={record.soilType} />
                          <DetailItem label="Owner" value={record.ownerName || profile?.fullName || '—'} />
                          <DetailItem label="Khata No" value={record.khataNo || '—'} />
                          <DetailItem label="Irrigation" value={record.irrigationSource || '—'} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-200/50 dark:border-blue-800/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Farm Data Integration</p>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            Your farm data is linked to the government's ROR (Record of Rights) system. All records, ownership details,
            and land surveys are unified in this portal — no need for multiple logins across different departments.
          </p>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value || '—'}</p>
    </div>
  );
}
