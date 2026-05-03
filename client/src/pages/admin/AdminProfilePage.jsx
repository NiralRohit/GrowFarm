import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, Save, Loader2, MapPin, 
  Mail, Phone, User, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', gender: '', dateOfBirth: '',
    address: { district: '', taluka: '', village: '' }
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
          address: data.address || { district: '', taluka: '', village: '' }
        });
      } catch (err) {
        toast.error('Failed to load admin profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', form);
      toast.success('Admin profile updated! 🎖️');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <AnimatedPage className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gray-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden border border-gray-800">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary-600 flex items-center justify-center text-3xl font-bold">
            {form.fullName?.charAt(0) || user?.role?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{form.fullName || 'Administrator'}</h1>
            <p className="text-gray-400 capitalize">{user?.role} Account 🛡️ 系统管理</p>
          </div>
          <div className="md:ml-auto">
             <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-white text-gray-900 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-50">
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Section title="Account Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
               <InputField label="Full Name" value={form.fullName} onChange={(v) => setForm({...form, fullName: v})} />
               <InputField label="Official Phone" value={user?.phone} readOnly />
               <InputField label="Official Email" value={user?.email} readOnly />
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm">
                    {['Male', 'Female', 'Other', 'Pending'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
            </div>
          </Section>

          <Section title="Location Assignment" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
               <InputField label="District" value={form.address.district} onChange={(v) => setForm({...form, address: {...form.address, district: v}})} />
               <InputField label="Taluka" value={form.address.taluka} onChange={(v) => setForm({...form, address: {...form.address, taluka: v}})} />
            </div>
          </Section>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4 text-primary-600" /> Security Status</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">2FA Status</span>
                    <span className="text-green-600 font-bold">Enabled</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Login</span>
                    <span className="text-gray-900 dark:text-white font-mono text-xs">{new Date().toLocaleDateString()}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2">
        <div className="p-1.5 bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600"><Icon className="w-4 h-4" /></div>
        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, readOnly = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <input value={value} onChange={(e) => !readOnly && onChange(e.target.value)} readOnly={readOnly}
        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 text-sm ${readOnly ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60' : ''}`} />
    </div>
  );
}
