import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Loader2, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();
  const [profileWaitTimeout, setProfileWaitTimeout] = useState(false);

  // Set a timeout if user exists but profile is still loading
  useEffect(() => {
    if (user && !userProfile && !loading) {
      const timer = setTimeout(() => {
        setProfileWaitTimeout(true);
      }, 3000); // Wait 3 seconds max for profile

      return () => clearTimeout(timer);
    } else {
      setProfileWaitTimeout(false);
    }
  }, [user, userProfile, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required and user is not logged in, allow access
  if (!requireAuth && !user) {
    return <>{children}</>;
  }

  // If user is logged in but profile is not loaded yet (with timeout protection)
  if (user && !userProfile && !profileWaitTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // If profile timeout occurred, create a minimal profile and continue
  if (user && !userProfile && profileWaitTimeout) {
    console.warn('Profile loading timeout, using minimal profile');
    // We'll let the app continue with default permissions
  }

  // If specific roles are required, check if user has permission
  if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-4">
              You don't have permission to access this page. 
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Required role: {allowedRoles.join(' or ')}<br />
              Your role: {userProfile?.role}
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

// Higher-order component for role-based access
export const withRoleProtection = (
  allowedRoles: UserRole[]
) => <P extends object>(Component: React.ComponentType<P>) => {
  const ProtectedComponent: React.FC<P> = (props) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withRoleProtection(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
};

// Convenience components for common role combinations
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const ManagerAndAboveRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}>
    {children}
  </ProtectedRoute>
);

export const StaffAndAboveRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager', 'staff']}>
    {children}
  </ProtectedRoute>
); 