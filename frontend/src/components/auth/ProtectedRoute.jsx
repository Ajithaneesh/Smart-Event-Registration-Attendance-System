import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false, approvedOnly = false }) {
  const { profile, isAdmin, loading, userStatus } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-xl">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  const isAdminPinVerified = sessionStorage.getItem('admin_pin_verified') === 'true';
  const isAuthorizedAdmin = isAdmin || isAdminPinVerified;

  // Admin-only routes
  if (adminOnly) {
    if (isAuthorizedAdmin) {
      return children;
    }
    if (location.pathname === '/admin') {
      return children;
    }
    return <Navigate to="/admin" replace />;
  }

  // Approved-only routes (e.g., event registration)
  if (approvedOnly) {
    if (!profile) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (userStatus === 'pending' && profile.role !== 'admin' && profile.role !== 'faculty') {
      return <Navigate to="/pending" state={{ from: location }} replace />;
    }
    if (userStatus === 'rejected') {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  // General protected routes
  if (!adminOnly && !approvedOnly && !profile) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

