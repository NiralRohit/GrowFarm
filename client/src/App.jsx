import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

// ── Lazy-loaded Pages ─────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const HomePage = lazy(() => import('./pages/farmer/HomePage'));
const ProfilePage = lazy(() => import('./pages/farmer/ProfilePage'));
const CropRecommendPage = lazy(() => import('./pages/farmer/CropRecommendPage'));
const DiseaseDetectPage = lazy(() => import('./pages/farmer/DiseaseDetectPage'));
const WeatherPage = lazy(() => import('./pages/farmer/WeatherPage'));
const SchemesPage = lazy(() => import('./pages/farmer/SchemesPage'));
const ChatPage = lazy(() => import('./pages/farmer/ChatPage'));
const BillingPage = lazy(() => import('./pages/farmer/BillingPage'));
const InsurancePage = lazy(() => import('./pages/farmer/InsurancePage'));
const FarmInfoPage = lazy(() => import('./pages/farmer/FarmInfoPage'));
const NotificationsPage = lazy(() => import('./pages/farmer/NotificationsPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const FarmerManagementPage = lazy(() => import('./pages/admin/FarmerManagementPage'));
const SchemeManagementPage = lazy(() => import('./pages/admin/SchemeManagementPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));
const ExpertDashboard = lazy(() => import('./pages/expert/ExpertDashboard'));
const ExpertFarmersPage = lazy(() => import('./pages/expert/ExpertFarmersPage'));
const TraderDashboard = lazy(() => import('./pages/trader/TraderDashboard'));

// ── Loading Spinner ───────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// ── Protected Route Wrapper ───────────────
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Redirect expert trying to access farmer-only routes to expert dashboard
  if (!roles && user?.role === 'expert' && !window.location.pathname.startsWith('/expert') && !window.location.pathname.startsWith('/chat') && !window.location.pathname.startsWith('/disease')) {
    return <Navigate to="/expert" replace />;
  }
  // Redirect users to their specific home based on role
  if (roles && !roles.includes(user?.role)) {
    if (user?.role === 'admin' || user?.role === 'govt') return <Navigate to="/admin" replace />;
    if (user?.role === 'expert') return <Navigate to="/expert" replace />;
    if (user?.role === 'trader') return <Navigate to="/trader" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();
  
  // Dynamic home redirect based on role
  const getHomeRoute = () => {
    if (user?.role === 'admin' || user?.role === 'govt') return "/admin";
    if (user?.role === 'expert') return "/expert";
    if (user?.role === 'trader') return "/trader";
    return "/dashboard";
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Farmer Routes */}
            <Route path="/dashboard" element={<ProtectedRoute roles={['farmer']}><HomePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute roles={['farmer']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/crop-recommend" element={<ProtectedRoute roles={['farmer', 'expert', 'admin']}><CropRecommendPage /></ProtectedRoute>} />
            <Route path="/disease-detect" element={<ProtectedRoute roles={['farmer', 'expert', 'admin']}><DiseaseDetectPage /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/farmer/bills" element={<ProtectedRoute roles={['farmer', 'admin', 'trader']}><BillingPage /></ProtectedRoute>} />
            <Route path="/farmer/insurance" element={<ProtectedRoute roles={['farmer', 'admin']}><InsurancePage /></ProtectedRoute>} />
            <Route path="/farmer/farm-info" element={<ProtectedRoute roles={['farmer', 'admin']}><FarmInfoPage /></ProtectedRoute>} />
            <Route path="/farmer/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Expert Routes */}
            <Route path="/expert" element={<ProtectedRoute roles={['expert']}><ExpertDashboard /></ProtectedRoute>} />
            <Route path="/expert/farmers" element={<ProtectedRoute roles={['expert']}><ExpertFarmersPage /></ProtectedRoute>} />
            <Route path="/expert/profile" element={<ProtectedRoute roles={['expert']}><AdminProfilePage /></ProtectedRoute>} />

            {/* Trader Routes */}
            <Route path="/trader" element={<ProtectedRoute roles={['trader']}><TraderDashboard /></ProtectedRoute>} />
            <Route path="/trader/profile" element={<ProtectedRoute roles={['trader']}><AdminProfilePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin', 'govt']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin/farmers" element={<ProtectedRoute roles={['admin', 'govt']}><FarmerManagementPage /></ProtectedRoute>} />
            <Route path="/admin/schemes" element={<ProtectedRoute roles={['admin', 'govt']}><SchemeManagementPage /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute roles={['admin', 'govt']}><AdminProfilePage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
            <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Layout>
  );
}
