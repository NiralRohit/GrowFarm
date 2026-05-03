import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import {
  ShieldCheck, Shield, Calendar, MapPin, Wheat, AlertTriangle,
  CheckCircle, Clock, XCircle, Plus, Loader2, IndianRupee,
  FileText, ChevronRight, Umbrella, Download
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { generateInsurancePDF } from '../../lib/pdfGenerator';

export default function InsurancePage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [summary, setSummary] = useState({ totalActive: 0, totalCoverage: 0, pendingClaims: 0, totalPremium: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesRes, summaryRes] = await Promise.all([
        api.get('/insurance-policy/policies'),
        api.get('/insurance-policy/summary')
      ]);
      setPolicies(policiesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      toast.error('Failed to fetch insurance data');
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

  const statusConfig = {
    active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Active' },
    pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pending' },
    claimed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText, label: 'Claimed' },
    expired: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icon: XCircle, label: 'Expired' },
    rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Rejected' },
  };

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Insurance Records 🛡️</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Crop insurance policies & claim tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {policies.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 text-sm disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Seed Demo Data
            </motion.button>
          )}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowApply(!showApply)}
            className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary-600/20 text-sm">
            <Plus className="w-4 h-4" /> Apply for Insurance
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Policies', value: summary.totalActive || 0, icon: Shield, bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Total Coverage', value: `₹${((summary.totalCoverage || 0) / 100000).toFixed(1)}L`, icon: Umbrella, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Premium Paid', value: `₹${(summary.totalPremium || 0).toLocaleString('en-IN')}`, icon: IndianRupee, bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Pending Claims', value: summary.pendingClaims || 0, icon: Clock, bg: 'bg-purple-50 dark:bg-purple-900/20' },
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

      {/* Apply Form */}
      <AnimatePresence>
        {showApply && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden">
            <ApplyInsuranceForm onSuccess={(policy) => { setPolicies([policy, ...policies]); setShowApply(false); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policies List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : policies.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No insurance policies found</p>
          <p className="text-gray-400 text-sm">Apply for PMFBY or WBCIS to protect your crops</p>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy, i) => {
            const config = statusConfig[policy.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedId === policy._id;

            return (
              <motion.div key={policy._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Policy Header */}
                <button onClick={() => setExpandedId(isExpanded ? null : policy._id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${
                      policy.status === 'active' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <Shield className={`w-6 h-6 ${policy.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{policy.policyName}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{policy.policyNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                      {config.label}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success('Preparing Certificate PDF...');
                        try {
                          generateInsurancePDF(policy);
                          toast.success('Certificate downloaded successfully!');
                        } catch (err) {
                          console.error('PDF Generation Error:', err);
                          toast.error('Failed to generate PDF');
                        }
                      }}
                      className="p-2 text-white bg-sky-600 rounded-xl hover:bg-sky-700 transition-all shadow-sm shadow-sky-600/30 flex items-center gap-1.5"
                      title="Download Certificate"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Cert</span>
                    </button>
                    <p className="text-lg font-black text-gray-900 dark:text-white hidden sm:block">₹{policy.coverageAmount?.toLocaleString('en-IN')}</p>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <InfoItem label="Provider" value={policy.provider} />
                          <InfoItem label="Scheme" value={policy.schemeName} />
                          <InfoItem label="Season" value={policy.season} />
                          <InfoItem label="Crops" value={policy.cropsCovered?.join(', ')} />
                          <InfoItem label="Land Area" value={`${policy.landArea} acres`} />
                          <InfoItem label="Survey No" value={policy.surveyNo} />
                          <InfoItem label="Premium" value={`₹${policy.farmerPremium?.toLocaleString('en-IN')}`} />
                          <InfoItem label="Subsidy" value={`${policy.subsidyPercentage}%`} />
                          <InfoItem label="Start Date" value={new Date(policy.startDate).toLocaleDateString('en-IN')} />
                          <InfoItem label="End Date" value={new Date(policy.endDate).toLocaleDateString('en-IN')} />
                          <InfoItem label="District" value={policy.district} />
                          <InfoItem label="Village" value={policy.village} />
                        </div>

                        {/* Claim Details */}
                        {policy.claimDetails && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Claim Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <InfoItem label="Claim ID" value={policy.claimDetails.claimId} />
                              <InfoItem label="Claim Amount" value={`₹${policy.claimDetails.claimAmount?.toLocaleString('en-IN')}`} />
                              <InfoItem label="Status" value={policy.claimDetails.claimStatus?.toUpperCase()} />
                              <InfoItem label="Settled" value={policy.claimDetails.settledAmount ? `₹${policy.claimDetails.settledAmount?.toLocaleString('en-IN')}` : '—'} />
                            </div>
                            {policy.claimDetails.claimReason && (
                              <p className="text-sm text-blue-700 dark:text-blue-400 mt-2"><strong>Reason:</strong> {policy.claimDetails.claimReason}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatedPage>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value || '—'}</p>
    </div>
  );
}

function ApplyInsuranceForm({ onSuccess }) {
  const [form, setForm] = useState({
    policyName: 'Pradhan Mantri Fasal Bima Yojana', provider: 'Agriculture Insurance Company of India',
    schemeName: 'PMFBY', cropsCovered: '', season: 'Kharif', coverageAmount: '',
    premiumAmount: '', subsidyPercentage: 50, landArea: '', surveyNo: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.coverageAmount || !form.landArea) return toast.error('Please fill in required fields');
    setSaving(true);
    try {
      const payload = { ...form, cropsCovered: form.cropsCovered.split(',').map(s => s.trim()).filter(Boolean), coverageAmount: Number(form.coverageAmount), premiumAmount: Number(form.premiumAmount), landArea: Number(form.landArea) };
      const { data } = await api.post('/insurance-policy/apply', payload);
      toast.success('Insurance application submitted! 🛡️');
      onSuccess(data.policy);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Plus className="w-5 h-5 text-primary-600" /> Apply for Crop Insurance</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput label="Scheme" value={form.schemeName} onChange={v => setForm({...form, schemeName: v})} />
        <FormInput label="Crops (comma-separated)" value={form.cropsCovered} onChange={v => setForm({...form, cropsCovered: v})} />
        <FormSelect label="Season" value={form.season} onChange={v => setForm({...form, season: v})} options={['Kharif', 'Rabi', 'Summer']} />
        <FormInput label="Coverage Amount (₹)" type="number" value={form.coverageAmount} onChange={v => setForm({...form, coverageAmount: v})} />
        <FormInput label="Premium Amount (₹)" type="number" value={form.premiumAmount} onChange={v => setForm({...form, premiumAmount: v})} />
        <FormInput label="Land Area (acres)" type="number" value={form.landArea} onChange={v => setForm({...form, landArea: v})} />
        <FormInput label="Survey Number" value={form.surveyNo} onChange={v => setForm({...form, surveyNo: v})} />
      </div>
      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={saving}
        className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Submit Application
      </motion.button>
    </form>
  );
}

function FormInput({ label, type = 'text', value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white appearance-none cursor-pointer">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
