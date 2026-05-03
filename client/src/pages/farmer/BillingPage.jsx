import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Receipt, TrendingUp, TrendingDown, DollarSign, Calendar,
  FileText, ArrowUpRight, ArrowDownRight, CreditCard, Landmark,
  Loader2, Search, Filter, Download, Eye, ChevronDown,
  IndianRupee, ShoppingCart, Wheat, BarChart3, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { generateInvoicePDF, generateLoanPDF } from '../../lib/pdfGenerator';

function InvoiceModal({ isOpen, onClose, bill }) {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    toast.success('Preparing Invoice PDF...');
    try {
      generateInvoicePDF(bill);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg"><Receipt className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tax Invoice</h3>
              <p className="text-xs text-gray-500">#{bill.billNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Download PDF</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">From (Seller)</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{bill.farmer?.fullName || 'GrowFarm Farmer'}</p>
              <p className="text-sm text-gray-500">Contact: {bill.farmer?.phone || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-semibold mb-1">To (Buyer)</p>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{bill.trader?.fullName || 'GrowFarm Trader'}</p>
              <p className="text-sm text-gray-500">Contact: {bill.trader?.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Quantity</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Rate</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4">
                    <p className="font-bold text-gray-900 dark:text-white">{bill.cropName}</p>
                    <p className="text-xs text-gray-500">Grade: {bill.grade}</p>
                  </td>
                  <td className="py-4 text-right font-medium text-gray-900 dark:text-white">{bill.quantity} {bill.unit}</td>
                  <td className="py-4 text-right font-medium text-gray-900 dark:text-white">₹{bill.rate?.toLocaleString('en-IN')}</td>
                  <td className="py-4 text-right font-bold text-primary-600 dark:text-primary-400">₹{bill.netPayable?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Transaction Date</p>
              <p className="font-bold text-gray-900 dark:text-white">{new Date(bill.transactionDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Total Amount Payable</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{bill.netPayable?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('apmc');
  const [bills, setBills] = useState([]);
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalTransactions: 0, activeLoanCount: 0, outstandingBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, summaryRes] = await Promise.all([
        api.get('/billing/history'),
        api.get('/billing/summary')
      ]);
      setBills(historyRes.data.bills || []);
      setLoans(historyRes.data.loans || []);
      setSummary(summaryRes.data);
    } catch (err) {
      toast.error('Failed to fetch billing data');
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
      console.error('Seeding error:', err);
      toast.error('Seeding failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const filteredBills = bills.filter(b =>
    b.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.billNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedPage className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Receipt className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Billing & Loans</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">APMC transactions, loans & financial records</p>
          </div>
        </div>

        {bills.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-600/20 disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Seed Demo Data
          </motion.button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sales', value: `₹${((summary.totalSales || 0) / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Transactions', value: summary.totalTransactions || 0, icon: ShoppingCart, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active Loans', value: summary.activeLoanCount || 0, icon: CreditCard, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Outstanding', value: `₹${((summary.outstandingBalance || 0) / 1000).toFixed(1)}K`, icon: Landmark, color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-6 w-fit">
        {[
          { id: 'apmc', label: '🧾 APMC Sales', icon: Wheat },
          { id: 'loans', label: '💰 Loans', icon: CreditCard },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-400 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* APMC Sales Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'apmc' && (
          <motion.div key="apmc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by crop or bill number..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-gray-900 dark:text-white" />
            </div>

            {/* Bills Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {['Bill No', 'Crop', 'Qty', 'Rate (₹)', 'Net Payable (₹)', 'Grade', 'Date', 'Buyer', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill, i) => (
                      <motion.tr key={bill._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-mono font-bold text-primary-600 dark:text-primary-400">{bill.billNo}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                              <Wheat className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{bill.cropName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{bill.quantity} {bill.unit}</td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">₹{bill.rate?.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{bill.netPayable?.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            bill.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            bill.grade === 'B' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{bill.grade}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(bill.transactionDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{bill.trader?.fullName || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedInvoice(bill)}
                              className="p-1.5 text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                toast.success('Preparing Invoice PDF...');
                                try {
                                  generateInvoicePDF(bill);
                                  toast.success('Invoice downloaded successfully!');
                                } catch (err) {
                                  console.error('PDF Generation Error:', err);
                                  toast.error('Failed to generate PDF');
                                }
                              }}
                              className="p-2 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-tighter">Bill</span>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBills.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No APMC transactions found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <motion.div key="loans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            {loans.map((loan, i) => (
              <motion.div key={loan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{loan.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{loan.lender}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      loan.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      loan.status === 'closed' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-red-100 text-red-700'
                    }`}>{loan.status}</span>
                    <button 
                      onClick={() => {
                        toast.success('Preparing Loan Summary PDF...');
                        try {
                          generateLoanPDF(loan);
                          toast.success('Summary downloaded successfully!');
                        } catch (err) {
                          console.error('PDF Generation Error:', err);
                          toast.error('Failed to generate PDF');
                        }
                      }}
                      className="p-2 text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-all shadow-sm shadow-amber-600/30 flex items-center gap-1.5"
                      title="Download Summary"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Doc</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Principal</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{loan.principal.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Interest</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{loan.interestRate}% p.a.</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Tenure</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{loan.tenure} months</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Outstanding</p>
                    <p className={`text-lg font-bold ${loan.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{loan.outstanding.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">Maturity</p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                </div>

                {loan.status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400">Repayment Progress</span>
                      <span className="text-xs font-bold text-primary-600">{Math.round(((loan.principal - loan.outstanding) / loan.principal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${((loan.principal - loan.outstanding) / loan.principal) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-primary-500 to-emerald-500 h-2.5 rounded-full" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {loans.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active loans found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceModal 
            isOpen={!!selectedInvoice} 
            onClose={() => setSelectedInvoice(null)} 
            bill={selectedInvoice} 
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
