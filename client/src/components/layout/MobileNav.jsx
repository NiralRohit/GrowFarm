import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Sprout, Bug, CloudSun, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/crop-recommend', icon: Sprout, label: 'Crops' },
  { to: '/disease-detect', icon: Bug, label: 'Scan' },
  { to: '/weather', icon: CloudSun, label: 'Weather' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-primary-100/30 dark:border-gray-800">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className="flex flex-col items-center gap-0.5 relative px-3 py-1">
              {active && (
                <motion.div
                  layoutId="mobileTab"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-primary-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
