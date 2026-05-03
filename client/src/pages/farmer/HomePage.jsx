import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout, Bug, CloudSun, FileText, MessageCircle, TrendingUp,
  ArrowRight, Lightbulb, Leaf, Droplets, Sun, Wind,
  Receipt, ShieldCheck, Globe, Bell
} from 'lucide-react';

// Staggered animation config
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const quickActions = [
  { to: '/crop-recommend', icon: Sprout, label: 'Crop Recommendation', desc: 'Find the best crops for your soil', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { to: '/disease-detect', icon: Bug, label: 'Disease Detection', desc: 'Scan your crop for diseases', color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  { to: '/weather', icon: CloudSun, label: 'Weather Forecast', desc: 'Real-time weather for your district', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { to: '/schemes', icon: FileText, label: 'Govt Schemes', desc: 'Apply & track scheme applications', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { to: '/chat', icon: MessageCircle, label: 'Smart Assistant', desc: 'Ask anything about farming', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { to: '/profile', icon: TrendingUp, label: 'My Profile', desc: 'Complete your farm profile', color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  { to: '/farmer/bills', icon: Receipt, label: 'Billing & Loans', desc: 'APMC billing & loan history', color: 'from-blue-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { to: '/farmer/insurance', icon: ShieldCheck, label: 'Insurance 🛡️', desc: 'Crop insurance & claims', color: 'from-sky-500 to-cyan-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  { to: '/farmer/farm-info', icon: Globe, label: 'Farm Information', desc: 'Aadhaar & ROR integration', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { to: '/farmer/notifications', icon: Bell, label: 'Alerts & Updates', desc: 'Weather alerts & scheme notifications', color: 'from-orange-500 to-red-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

const tips = [
  { icon: Leaf, text: 'Apply Neem oil every 7 days during early monsoon to prevent fungal diseases.' },
  { icon: Droplets, text: 'Drip irrigation can save up to 60% water compared to flood irrigation.' },
  { icon: Sun, text: 'Sow wheat between October 15-November 15 for best yield in Gujarat.' },
  { icon: Wind, text: 'Strong winds expected this week — secure your crop covers and nets.' },
];

export default function HomePage() {
  const { user } = useAuth();
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <AnimatedPage>
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm text-primary-200 mb-6 border border-white/10"
              >
                <Leaf className="w-4 h-4 text-primary-300" /> Smart Farming Platform
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Namaste,{' '}
                <span className="bg-gradient-to-r from-primary-300 to-accent-400 bg-clip-text text-transparent">
                  {user?.fullName || 'Farmer'}
                </span>
                ! 🌾
              </h1>
              <p className="text-lg text-primary-200 max-w-xl mb-8">
                Your intelligent farming companion. Get personalized crop recommendations,
                detect diseases early, and access government schemes — all in one place.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/crop-recommend">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-white text-primary-800 font-semibold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Sprout className="w-5 h-5" /> Get Crop Advice <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/disease-detect">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl flex items-center gap-2 border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <Bug className="w-5 h-5" /> Scan Disease
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Hero visual — floating icons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden lg:block relative w-80 h-80"
            >
              {[
                { Icon: Sprout, x: '10%', y: '10%', delay: 0 },
                { Icon: CloudSun, x: '60%', y: '5%', delay: 0.2 },
                { Icon: Bug, x: '75%', y: '55%', delay: 0.4 },
                { Icon: FileText, x: '5%', y: '65%', delay: 0.6 },
                { Icon: Leaf, x: '40%', y: '40%', delay: 0.3 },
              ].map(({ Icon, x, y, delay }, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay }}
                  className="absolute w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20"
                  style={{ left: x, top: y }}
                >
                  <Icon className="w-8 h-8 text-white/80" />
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400/30 to-accent-400/30 rounded-full blur-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Daily Tip Card ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-accent-50 to-amber-50 dark:from-accent-900/20 dark:to-amber-900/20 rounded-2xl p-5 flex items-center gap-4 shadow-card border border-accent-200/50 dark:border-accent-800/30"
        >
          <div className="p-3 bg-accent-100 dark:bg-accent-800/30 rounded-xl shrink-0">
            <Lightbulb className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-800 dark:text-accent-300">Daily Farming Tip</p>
            <p className="text-sm text-accent-700 dark:text-accent-400">{randomTip.text}</p>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Actions Grid ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Everything you need for smarter farming
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
        >
          {quickActions.map(({ to, icon: Icon, label, desc, color, bg }) => (
            <motion.div key={to} variants={item}>
              <Link to={to}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(22,101,52,0.12)' }}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-800 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${color} bg-clip-text`} style={{ color: 'inherit' }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{desc}</p>
                  <div className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats Section ──────────────────── */}
      <section className="bg-primary-800 dark:bg-primary-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '33', label: 'Districts Covered', suffix: '' },
              { value: '50', label: 'Crop Profiles', suffix: '+' },
              { value: '100', label: 'Disease Models', suffix: '+' },
              { value: '24/7', label: 'Weather Updates', suffix: '' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {stat.value}<span className="text-primary-300">{stat.suffix}</span>
                </div>
                <div className="text-sm text-primary-300 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatedPage>
  );
}
