import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Save, Loader2, MapPin, Landmark, 
  CheckCircle, FileText, Calendar, Phone, Mail,
  Receipt, ShieldCheck
} from 'lucide-react';
import { ProfileSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', gender: '', dateOfBirth: '', category: '', physicalHandicap: '', qualification: '',
    rationCardCategory: '', rationCardNumber: '',
    address: { district: '', taluka: '', village: '', pincode: '', fullAddress: '' },
    bankDetails: { accountNo: '', ifsc: '', bankName: '' },
    interestInContractFarming: false,
    farmSize: 0, cropsGrown: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/profile');
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          gender: data.gender || 'Pending',
          dateOfBirth: data.dateOfBirth?.split('T')[0] || '',
          category: data.category || 'Pending',
          physicalHandicap: data.physicalHandicap || 'None',
          qualification: data.qualification || '',
          rationCardCategory: data.rationCardCategory || '',
          rationCardNumber: data.rationCardNumber || '',
          address: data.address || { district: '', taluka: '', village: '', pincode: '', fullAddress: '' },
          bankDetails: data.bankDetails || { accountNo: '', ifsc: '', bankName: '' },
          interestInContractFarming: !!data.interestInContractFarming,
          farmSize: data.farmSize || 0,
          cropsGrown: (data.cropsGrown || []).join(', '),
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { 
        ...form, 
        cropsGrown: form.cropsGrown.split(',').map(s => s.trim()).filter(Boolean) 
      };
      const { data } = await api.put('/profile', payload);
      setProfile(data.profile);
      toast.success('Profile updated successfully! 🌾');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const pct = profile?.completionPercentage || 0;
  const circumference = 2 * Math.PI * 36;

  if (loading) return <AnimatedPage className="max-w-4xl mx-auto px-4 py-10"><ProfileSkeleton /></AnimatedPage>;

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Header with Completion Ring */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#f1f5f9" strokeWidth="6" />
            <motion.circle cx="40" cy="40" r="36" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * pct) / 100 }}
              transition={{ duration: 1.5, ease: 'easeOut' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-primary-700 dark:text-primary-400">{pct}%</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Profile</span>
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{form.fullName || 'Farmer Profile'}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full font-mono font-bold">
               ID: {profile?.farmerId || 'PENDING'}
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
               <Phone className="w-4 h-4" /> {user?.phone}
            </div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
          className="px-8 py-3.5 bg-primary-600 text-white font-bold rounded-2xl flex items-center gap-2 shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all disabled:opacity-60">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Profile</>}
        </motion.button>
      </div>

      <div className="space-y-8">
        {/* Personal Details */}
        <ProfileSection title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditableField label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} />
            <EditableSelect label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={['Male', 'Female', 'Other']} />
            <EditableField label="Date of Birth" value={form.dateOfBirth} onChange={(v) => setForm({ ...form, dateOfBirth: v })} type="date" />
            <EditableSelect label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={['GENERAL', 'OBC', 'SC', 'ST', 'EWS']} />
            <EditableSelect label="Physical Handicap" value={form.physicalHandicap} onChange={(v) => setForm({ ...form, physicalHandicap: v })} options={['None', 'Visual', 'Hearing', 'Orthopedic', 'Other']} />
            <EditableField label="Qualification" value={form.qualification} onChange={(v) => setForm({ ...form, qualification: v })} />
            <EditableField label="Email Address" value={user?.email || 'Not Provided'} readOnly />
            <EditableField label="Aadhaar Number" value={user?.aadhaarNumber || 'Not Provided'} readOnly />
            <div className="md:col-span-1">
              <EditableSelect label="Ration Card Category" value={form.rationCardCategory} onChange={(v) => setForm({ ...form, rationCardCategory: v })} options={['APL-1', 'APL-2', 'BPL', 'AAY']} />
            </div>
            <EditableField label="Ration Card No" value={form.rationCardNumber} onChange={(v) => setForm({ ...form, rationCardNumber: v })} />
          </div>
        </ProfileSection>

        {/* Location Details */}
        <ProfileSection title="Location" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditableField label="District" value={form.address.district} onChange={(v) => setForm({ ...form, address: { ...form.address, district: v } })} />
            <EditableField label="Taluka" value={form.address.taluka} onChange={(v) => setForm({ ...form, address: { ...form.address, taluka: v } })} />
            <EditableField label="Village" value={form.address.village} onChange={(v) => setForm({ ...form, address: { ...form.address, village: v } })} />
            <EditableField label="Pincode" value={form.address.pincode} onChange={(v) => setForm({ ...form, address: { ...form.address, pincode: v } })} />
            <div className="md:col-span-2">
               <EditableField label="Full Address" value={form.address.fullAddress} onChange={(v) => setForm({ ...form, address: { ...form.address, fullAddress: v } })} />
            </div>
          </div>
        </ProfileSection>

        {/* Bank & Interests */}
        <ProfileSection title="Bank Details" icon={Landmark}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditableField label="Bank Name" value={form.bankDetails.bankName} onChange={(v) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: v } })} />
            <EditableField label="Account Number" value={form.bankDetails.accountNo} onChange={(v) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNo: v } })} />
            <EditableField label="IFSC Code" value={form.bankDetails.ifsc} onChange={(v) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifsc: v } })} />
            {user?.role === 'farmer' && (
              <div className="flex items-center gap-4 pt-4 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Interested in Contract Farming?</label>
                <input type="checkbox" checked={form.interestInContractFarming} onChange={(e) => setForm({ ...form, interestInContractFarming: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </div>
            )}
          </div>
        </ProfileSection>

        {/* Farmer-Only Sections */}
        {user?.role === 'farmer' && (
          <>
            <ProfileSection title="Farm Records" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField label="Farm Size (Acres)" type="number" value={form.farmSize} onChange={(v) => setForm({ ...form, farmSize: v })} />
                <EditableField label="Crops Grown (comma-separated)" value={form.cropsGrown} onChange={(v) => setForm({ ...form, cropsGrown: v })} />
              </div>
            </ProfileSection>

            <ProfileSection title="Billing & Loan History" icon={Receipt}>
              <div className="text-gray-500 dark:text-gray-400 text-sm py-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                No recent billing or loan records found.
              </div>
            </ProfileSection>

            <ProfileSection title="Insurance Records 🛡️" icon={ShieldCheck}>
              <div className="text-gray-500 dark:text-gray-400 text-sm py-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                You have no active crop insurance policies. Contact your local agriculture office to apply.
              </div>
            </ProfileSection>
          </>
        )}
      </div>
    </AnimatedPage>
  );
}

function ProfileSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EditableField({ label, value, onChange, type = 'text', readOnly = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => !readOnly && onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm text-gray-900 dark:text-white ${readOnly ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed text-gray-400' : ''}`} />
    </div>
  );
}

function EditableSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary-500 outline-none transition-all text-sm text-gray-900 dark:text-white appearance-none cursor-pointer">
        <option value="Pending">Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
