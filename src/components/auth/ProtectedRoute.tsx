
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePremium?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requirePremium = false 
}) => {
  const { user, loading, isAdmin } = useAuth();
  const { hasPremiumAccess, isLoading: premiumLoading } = usePremiumAccess();

  if (loading || (requirePremium && premiumLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requirePremium && !hasPremiumAccess) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
};
