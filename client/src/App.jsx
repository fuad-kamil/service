import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import CategoriesPage from './pages/public/CategoriesPage';
import CategoryPage from './pages/public/CategoryPage';
import ProviderProfilePage from './pages/public/ProviderProfilePage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import AboutPage from './pages/public/AboutPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User Dashboard Pages
import UserDashboard from './pages/user/UserDashboard';
import SavedProviders from './pages/user/SavedProviders';
import MyInquiries from './pages/user/MyInquiries';
import UserProfile from './pages/user/UserProfile';

// Provider Dashboard Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ManageServices from './pages/provider/ManageServices';
import ManageProfile from './pages/provider/ManageProfile';
import InquiriesInbox from './pages/provider/InquiriesInbox';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProviderApprovals from './pages/admin/ProviderApprovals';
import CategoryManagement from './pages/admin/CategoryManagement';
import UserManagement from './pages/admin/UserManagement';

import { Spinner } from './components/ui';

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}


import useThemeStore from './store/useThemeStore';

export default function App() {
  const { fetchMe } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    fetchMe();
  }, [fetchMe, initTheme]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#020817] text-slate-100">
        <Toaster position="top-right" toastOptions={{ style: { background: '#0a1628', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/providers/:slug" element={<ProviderProfilePage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/saved" element={<ProtectedRoute allowedRoles={['user']}><SavedProviders /></ProtectedRoute>} />
            <Route path="/dashboard/inquiries" element={<ProtectedRoute allowedRoles={['user']}><MyInquiries /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>} />

            {/* Provider Routes */}
            <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/services" element={<ProtectedRoute allowedRoles={['provider']}><ManageServices /></ProtectedRoute>} />
            <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['provider']}><ManageProfile /></ProtectedRoute>} />
            <Route path="/provider/inquiries" element={<ProtectedRoute allowedRoles={['provider']}><InquiriesInbox /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={['admin']}><ProviderApprovals /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoryManagement /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
