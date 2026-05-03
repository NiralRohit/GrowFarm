import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { FileText, ArrowRight, CheckCircle, Clock, AlertCircle, Loader2, XCircle, Search, Eye } from 'lucide-react';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const statusConfig = {
  Submitted: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  'In Review': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Eye },
  Approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  Rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  Draft: { color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icon: FileText },
};

export default function SchemesPage() {
  const [activeTab, setActiveTab] = useState('browse');
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schemesRes, appsRes] = await Promise.all([
          api.get('/schemes/all'),
          api.get('/schemes/my-applications').catch(() => ({ data: [] }))
        ]);
        setSchemes(schemesRes.data);
        setApplications(appsRes.data);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const applyForScheme = async (schemeId) => {
    setApplying(schemeId);
    try {
      const { data } = await api.post('/schemes/apply', { schemeId });
      toast.success('Application submitted! 🎉');
      // Refresh applications
      const appsRes = await api.get('/schemes/my-applications').catch(() => ({ data: [] }));
      setApplications(appsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setApplying(null); }
  };

  const appliedSchemeIds = applications.map(a => a.scheme?._id || a.scheme);

  return (
    <AnimatedPage className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><FileText className="w-6 h-6 text-amber-600" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Government Schemes</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Browse, apply & track your scheme applications</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6 w-fit">
        {[
          { id: 'browse', label: '📜 Browse Schemes' },
          { id: 'track', label: `📝 My Applications (${applications.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Browse Schemes Tab */}
        {activeTab === 'browse' && (
          <motion.div key="browse" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
              </div>
            ) : schemes.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No schemes available right now</p>
                <p className="text-gray-400 text-sm">Check back later for new government programs</p>
              </div>
            ) : (
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map((scheme) => {
                  const alreadyApplied = appliedSchemeIds.includes(scheme._id);
                  return (
                    <motion.div key={scheme._id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-800 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{scheme.title}</h3>
                        {scheme.isActive && (
                          <span className="shrink-0 ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">{scheme.description}</p>
                      
                      {scheme.benefits && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-3 mb-4">
                          <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 mb-1">Benefits</p>
                          <p className="text-sm text-primary-600 dark:text-primary-400">{scheme.benefits}</p>
                        </div>
                      )}

                      {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {scheme.documentsRequired.map(doc => (
                            <span key={doc} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold rounded-lg uppercase">{doc}</span>
                          ))}
                        </div>
                      )}

                      {scheme.deadline && (
                        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN')}
                        </p>
                      )}

                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => !alreadyApplied && applyForScheme(scheme._id)} 
                        disabled={applying === scheme._id || alreadyApplied}
                        className={`w-full py-2.5 font-medium rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 ${
                          alreadyApplied 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                            : 'bg-gradient-to-r from-primary-700 to-primary-600 text-white'
                        }`}>
                        {applying === scheme._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                         alreadyApplied ? <><CheckCircle className="w-4 h-4" /> Applied</> : 
                         <><ArrowRight className="w-4 h-4" /> Apply Now</>}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Application Tracking Tab */}
        {activeTab === 'track' && (
          <motion.div key="track" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {applications.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No applications yet</p>
                <p className="text-gray-400 text-sm">Browse schemes and apply to track your progress here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, i) => {
                  const config = statusConfig[app.status] || statusConfig.Submitted;
                  const StatusIcon = config.icon;

                  return (
                    <motion.div key={app._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.scheme?.title || 'Scheme'}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{app.scheme?.description}</p>
                        </div>
                        <span className={`shrink-0 ml-4 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${config.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {app.status}
                        </span>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> Applied: {new Date(app.appliedOn).toLocaleDateString('en-IN')}
                        </div>
                        {app.updatedOn && app.updatedOn !== app.appliedOn && (
                          <>
                            <span className="text-gray-300">→</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              Updated: {new Date(app.updatedOn).toLocaleDateString('en-IN')}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {app.adminRemarks && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                          <strong>Remarks:</strong> {app.adminRemarks}
                        </div>
                      )}

                      {app.scheme?.benefits && (
                        <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl text-sm text-primary-700 dark:text-primary-400">
                          <strong>Benefits:</strong> {app.scheme.benefits}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
