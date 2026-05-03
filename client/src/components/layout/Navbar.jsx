import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Leaf, Menu, X, Sun, Moon, LogOut, User, Home, Sprout,
  Bug, CloudSun, FileText, MessageCircle, BarChart3, ShoppingCart,
  Receipt, ShieldCheck, Globe, Bell, GraduationCap, Users,
} from 'lucide-react';

const farmerLinks = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/crop-recommend', label: 'Crops', icon: Sprout },
  { to: '/disease-detect', label: 'Disease', icon: Bug },
  { to: '/weather', label: 'Weather', icon: CloudSun },
  { to: '/schemes', label: 'Schemes', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/farmer/bills', label: 'Billing', icon: Receipt },
  { to: '/farmer/insurance', label: 'Insurance', icon: ShieldCheck },
  { to: '/farmer/farm-info', label: 'Farm Info', icon: Globe },
  { to: '/farmer/notifications', label: 'Alerts', icon: Bell },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/farmers', label: 'Farmers', icon: User },
  { to: '/admin/schemes', label: 'Schemes', icon: FileText },
];

const traderLinks = [
  { to: '/trader', label: 'Portal', icon: BarChart3 },
  { to: '/farmer/bills', label: 'Invoices', icon: Receipt },
  { to: '/weather', label: 'Weather', icon: CloudSun },
];

const expertLinks = [
  { to: '/expert', label: 'Dashboard', icon: GraduationCap },
  { to: '/expert/farmers', label: 'Farmers', icon: Users },
  { to: '/chat', label: 'Consult', icon: MessageCircle },
  { to: '/disease-detect', label: 'Disease AI', icon: Bug },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getHomeRoute = () => {
    if (user?.role === 'admin' || user?.role === 'govt') return "/admin";
    if (user?.role === 'expert') return "/expert";
    if (user?.role === 'trader') return "/trader";
    return "/dashboard";
  };

  const links = user?.role === 'admin' || user?.role === 'govt'
    ? adminLinks
    : user?.role === 'trader'
    ? traderLinks
    : user?.role === 'expert'
    ? expertLinks
    : farmerLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-primary-100/30 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? getHomeRoute() : '/login'} className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 15 }} className="p-1.5 bg-primary-600 rounded-xl">
              <Leaf className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-primary-800 dark:text-primary-400">
              Grow<span className="text-accent-500">Farm</span>
            </span>
          </Link>

          {/* Desktop Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300'
                        : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50 dark:text-gray-400 dark:hover:text-primary-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Right side: Theme + Profile + Mobile Burger */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-5 h-5 text-accent-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </motion.button>

            {isAuthenticated && (
              <>
                <Link to={user?.role === 'farmer' ? '/profile' : `${getHomeRoute()}/profile`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-gray-800 border border-primary-200 dark:border-gray-700"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user?.fullName?.charAt(0) || user?.phone?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-primary-800 dark:text-primary-300">
                      {user?.farmerId || user?.phone || 'Profile'}
                    </span>
                  </motion.div>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                  className="hidden md:flex p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — slides in from right */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-primary-100/30 dark:border-gray-800"
          >
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated &&
                links.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'bg-primary-100 text-primary-800'
                        : 'text-gray-600 hover:bg-primary-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 w-full hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
