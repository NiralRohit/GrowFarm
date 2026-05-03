import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { 
  User, MapPin, CreditCard, Lock, Phone, Mail, 
  Calendar, Briefcase, Award, Home, Landmark, 
  CheckCircle, ArrowRight, Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const role = user?.role;
      if (role === 'admin' || role === 'govt') navigate('/admin', { replace: true });
      else if (role === 'trader') navigate('/trader/bills', { replace: true });
      else if (role === 'expert') navigate('/expert', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    // Auth
    phone: '', password: '', confirmPassword: '', email: '', role: 'farmer',
    
    // Personal
    fullName: '', gender: '', dob: '', category: '', handicap: 'None', qualification: '', rationCardCategory: '', rationCardNumber: '',
    
    // Location
    state: 'Gujarat', district: '', taluka: '', village: '', pincode: '', fullAddress: '',
    
    // Bank
    bankName: '', ifsc: '', accountNo: '', confirmAccountNo: '',
    
    // Auth Details
    aadhaarNumber: '', contractFarming: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validations
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.role === 'farmer' && form.accountNo !== form.confirmAccountNo) return toast.error('Account numbers do not match');
    if (!form.phone || !form.fullName || !form.district || !form.password) {
        return toast.error('Please fill in all required fields (Name, Phone, Password, District)');
    }

    setLoading(true);
    try {
      const resp = await register(form);
      toast.success(`Welcome to GrowFarm! Farmer ID: ${resp.farmerId}`);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen bg-surface-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex p-3 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/20">
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Farmer Registration Form</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Join the future of smart agriculture in Gujarat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role selector */}
          <div className="bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex gap-2">
            {['farmer', 'trader', 'admin', 'expert'].map((r) => (
              <motion.button key={r} type="button" whileTap={{ scale: 0.95 }} onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${form.role === r ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {r}
              </motion.button>
            ))}
          </div>

          {form.role === 'farmer' ? (
            <>
              {/* Section 1: Personal Information */}
              <FormSection title="Personal Information" icon={User}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} required />
                  <Select label="Gender" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                  <Select label="Category" name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select your Category</option>
                    <option value="GENERAL">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </Select>
                  <Select label="Physical Handicap" name="handicap" value={form.handicap} onChange={handleChange}>
                    <option value="None">None</option>
                    <option value="Visual">Visual</option>
                    <option value="Hearing">Hearing</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </Select>
                  <Select label="Qualification" name="qualification" value={form.qualification} onChange={handleChange}>
                    <option value="">Select your Qualification</option>
                    <option value="Below SSC">Below SSC</option>
                    <option value="SSC">SSC (10th)</option>
                    <option value="HSC">HSC (12th)</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </Select>
                  <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
                  <Select label="Ration Card Category" name="rationCardCategory" value={form.rationCardCategory} onChange={handleChange}>
                    <option value="">Select your Ration Card Type</option>
                    <option value="APL-1">APL-1</option>
                    <option value="APL-2">APL-2</option>
                    <option value="BPL">BPL</option>
                    <option value="Antyodaya">Antyodaya (AAY)</option>
                  </Select>
                  <Input label="Ration Card Number" name="rationCardNumber" placeholder="1967-425-5901" value={form.rationCardNumber} onChange={handleChange} />
                </div>
              </FormSection>

              {/* Section 2: Farm Location & Other Details */}
              <FormSection title="Farm Location and Other Details" icon={MapPin}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Input label="State" name="state" value="Gujarat" disabled className="bg-gray-100 cursor-not-allowed" />
                  <Input label="District" name="district" placeholder="Select your District" value={form.district} onChange={handleChange} required />
                  <Input label="Taluka" name="taluka" placeholder="Select Taluka" value={form.taluka} onChange={handleChange} />
                  <Input label="Village" name="village" placeholder="Select Village" value={form.village} onChange={handleChange} />
                  <Input label="Pincode" name="pincode" placeholder="Enter Your Pincode" value={form.pincode} onChange={handleChange} />
                  <div className="md:col-span-2 lg:col-span-3">
                    <TextArea label="Farmer Address" name="fullAddress" placeholder="Full Address" value={form.fullAddress} onChange={handleChange} />
                  </div>
                </div>
              </FormSection>

              {/* Section 3: Bank Details */}
              <FormSection title="Bank Details" icon={Landmark}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Input label="Bank Name" name="bankName" placeholder="Enter Bank Name" value={form.bankName} onChange={handleChange} />
                  <Input label="IFSC Code" name="ifsc" placeholder="Enter IFSC code" value={form.ifsc} onChange={handleChange} />
                  <Input label="Account Number" name="accountNo" type="password" placeholder="Enter Account Number" value={form.accountNo} onChange={handleChange} />
                  <Input label="Confirm Account Number" name="confirmAccountNo" placeholder="Confirm Account Number" value={form.confirmAccountNo} onChange={handleChange} />
                </div>
              </FormSection>

              {/* Section 4: Authentication Details */}
              <FormSection title="Authentication Details" icon={CheckCircle}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aadhaar-Card</label>
                    <input name="aadhaarNumber" placeholder="Enter Aadhaar-Card Number" value={form.aadhaarNumber} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mobile</label>
                    <input name="phone" placeholder="Enter Mobile Number" value={form.phone} onChange={handleChange} required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                    <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[200px]">Are you interested in Contract Farming?</label>
                    <select name="contractFarming" value={form.contractFarming} onChange={handleChange}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none w-32 font-medium">
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>

                  <Input label="Create password" name="password" type="password" placeholder="Enter Password" value={form.password} onChange={handleChange} required />
                  <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </FormSection>
            </>
          ) : form.role === 'expert' ? (
            <FormSection title="Expert / Agricultural Advisor Registration" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" placeholder="Enter mobile number" value={form.phone} onChange={handleChange} required />
                <Input label="Specialization / District" name="district" placeholder="e.g. Rajkot - Crop Science" value={form.district} onChange={handleChange} />
                <Input label="Email (optional)" name="email" type="email" placeholder="Expert email" value={form.email} onChange={handleChange} />
                <Input label="Create password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </FormSection>
          ) : (
            <FormSection title={`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} Registration`} icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={form.fullName} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" placeholder="Enter mobile number" value={form.phone} onChange={handleChange} required />
                <Input label="District" name="district" placeholder="Enter District" value={form.district} onChange={handleChange} required />
                <Input label="Taluka" name="taluka" placeholder="Enter Taluka" value={form.taluka} onChange={handleChange} required />
                <Input label="Create password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </FormSection>
          )}

          <div className="pt-6">
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading}
              className="w-full py-4 bg-primary-700 hover:bg-primary-800 text-white font-bold text-lg rounded-2xl shadow-xl shadow-primary-700/20 flex items-center justify-center gap-3 disabled:opacity-60 transition-all">
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign Up <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
              Already registered? <Link to="/login" className="text-primary-600 font-bold hover:underline">sign in?</Link>
            </p>
          </div>
        </form>
      </div>
    </AnimatedPage>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-card">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">
        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-primary-800 dark:text-primary-400">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <input {...props} className={"w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm " + props.className} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <select {...props} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm appearance-none cursor-pointer">
        {children}
      </select>
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <textarea {...props} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-sm" />
    </div>
  );
}
