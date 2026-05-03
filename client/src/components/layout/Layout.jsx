import Navbar from './Navbar';
import MobileNav from './MobileNav';
import ScrollProgress from '../ui/ScrollProgress';
import { useAuth } from '../../context/AuthContext';

export default function Layout({ children }) {
  const { isAuthenticated, user } = useAuth();
  const isFarmer = user?.role === 'farmer' || !user?.role;

  return (
    <div className="min-h-screen flex flex-col leaf-pattern dark:bg-gray-950">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      {isAuthenticated && isFarmer && <MobileNav />}
    </div>
  );
}
