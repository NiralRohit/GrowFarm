import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { 
  Plus, Search, Loader2, FileText, CheckCircle, XCircle, 
  User, MapPin, Eye, FileDigit, Filter, Edit, Trash2, X 
} from 'lucide-react';
import { ManagementSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function SchemeManagementPage() {
  const [activeTab, setActiveTab] = useState('Applications');
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [sch, app] = await Promise.all([
          api.get('/schemes/all'),
          api.get('/schemes/applications/all')
        ]);
        setSchemes(sch.data);
        setApplications(app.data);
      } catch (err) {
        toast.error('Failed to load dynamic data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpdateStatus = async (appId, status) => {
    const remarks = window.prompt(`Admin Remarks for ${status}:`);
    if (remarks === null) return;
    try {
      await api.patch('/schemes/status', { applicationId: appId, status, remarks });
      setApplications(applications.map(a => a._id === appId ? { ...a, status, adminRemarks: remarks } : a));
      toast.success(`Application ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      benefits: formData.get('benefits'),
      subsidyPercentage: Number(formData.get('subsidy')),
      eligibility: {
        district: formData.get('districts').split(',').map(s => s.trim()),
        minFarmSize: Number(formData.get('minSize')),
        maxFarmSize: Number(formData.get('maxSize')),
        crops: formData.get('crops').split(',').map(s => s.trim()),
        roles: ['farmer']
      },
      isActive: true
    };

    setSaving(true);
    try {
      if (editingScheme) {
        const { data } = await api.put(`/schemes/${editingScheme._id}`, payload);
        setSchemes(schemes.map(s => s._id === editingScheme._id ? data.scheme : s));
        toast.success('Scheme updated');
      } else {
        const { data } = await api.post('/schemes/create', payload);
        setSchemes([data.scheme, ...schemes]);
        toast.success('Scheme created');
      }
      setIsModalOpen(false);
      setEditingScheme(null);
    } catch {
      toast.error('Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Delete this scheme and ALL its applications?')) return;
    try {
      await api.delete(`/schemes/${id}`);
      setSchemes(schemes.filter(s => s._id !== id));
      toast.success('Scheme deleted');
    } catch {
      toast.error('Deletion failed');
    }
  };

  if (loading) return <AnimatedPage className="max-w-7xl mx-auto px-4 py-10"><ManagementSkeleton /></AnimatedPage>;

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scheme & Support</h1>
          <p className="text-sm text-gray-500">Manage support schemes and review farmer applications</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {['Applications', 'Catalog'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'Catalog' && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setEditingScheme(null); setIsModalOpen(true); }}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-600/20">
              <Plus className="w-4 h-4" /> Create Scheme
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Applications' ? (
          <motion.div key="apps" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            {applications.map((app, i) => (
              <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                      <FileDigit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{app.scheme?.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5" /> {app.user?.fullName} ({app.user?.phone})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-400">Date: {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Location</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{app.user?.district}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Survey No</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{app.landSurveyNo}</p>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Remarks</p>
                      <p className="text-sm text-gray-500 italic">"{app.adminRemarks || 'Waiting for review...'}"</p>
                    </div>
                  </div>

                  {app.status === 'Pending' && (
                    <div className="flex gap-2">
                       <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                        className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/40">
                         <XCircle className="w-5 h-5" />
                       </motion.button>
                       <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(app._id, 'Approved')}
                        className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 flex items-center gap-2">
                         <CheckCircle className="w-4 h-4" /> Approve
                       </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="catalog" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme, i) => (
              <motion.div key={scheme._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center text-accent-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingScheme(scheme); setIsModalOpen(true); }} className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteScheme(scheme._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{scheme.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{scheme.description}</p>
                <div className="space-y-1.5 mb-6 text-xs text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-2 font-medium"><MapPin className="w-3.5 h-3.5" /> Eligibility: {scheme.eligibility?.district.join(', ')}</p>
                  <p className="flex items-center gap-2 font-medium font-mono text-primary-600 dark:text-primary-400">🎁 Benefit: {scheme.benefits}</p>
                </div>
                <button onClick={() => { setEditingScheme(scheme); setIsModalOpen(true); }} className="w-full py-2.5 rounded-xl border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  Edit Details
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Create/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                   {editingScheme ? <Edit className="w-5 h-5 text-primary-600" /> : <Plus className="w-5 h-5 text-primary-600" />}
                   {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSaveScheme} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Title</label>
                    <input name="title" defaultValue={editingScheme?.title} required className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Description</label>
                    <textarea name="description" defaultValue={editingScheme?.description} rows="3" required className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Benefits</label>
                    <input name="benefits" defaultValue={editingScheme?.benefits} required className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Subsidy %</label>
                    <input name="subsidy" type="number" defaultValue={editingScheme?.subsidyPercentage} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Districts (comma separated)</label>
                    <input name="districts" defaultValue={editingScheme?.eligibility?.district.join(', ') || 'All'} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Min Farm Size (Acres)</label>
                    <input name="minSize" type="number" defaultValue={editingScheme?.eligibility?.minFarmSize || 0} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Max Farm Size (Acres)</label>
                    <input name="maxSize" type="number" defaultValue={editingScheme?.eligibility?.maxFarmSize || 100} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Applicable Crops (comma separated)</label>
                    <input name="crops" defaultValue={editingScheme?.eligibility?.crops.join(', ') || 'Any'} className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 transition-all">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-[2] py-3.5 px-6 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingScheme ? 'Update Scheme' : 'Create Scheme'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
