import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    if (role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
      // Allow both admin and superadmin to access admin routes
    } else if (user.role !== role) {
      const redirectPath = 
        user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/student';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default PrivateRoute;
