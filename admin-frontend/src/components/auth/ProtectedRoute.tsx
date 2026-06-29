import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdminPinVerified = sessionStorage.getItem('admin_pin_verified') === 'true';
  const isAuthorizedAdmin = isAdmin || isAdminPinVerified;

  if (adminOnly) {
    if (isAuthorizedAdmin) {
      return <>{children}</>;
    }
    
    // If not authorized but trying to access the main /admin route, allow them to view it (it will show the PIN prompt)
    if (location.pathname === '/admin') {
      return <>{children}</>;
    }
    
    // For other admin routes, redirect to /admin to authenticate via PIN
    return <Navigate to="/admin" replace />;
  }

  // Regular protected route
  if (!profile) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

