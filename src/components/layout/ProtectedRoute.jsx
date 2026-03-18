import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../../store/useStore';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', height: '100vh',
    background: '#0A0A0F'
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: '3px solid #222233',
      borderTop: '3px solid #00FF94',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useStore();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (role && profile?.role !== role) {
    if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (profile?.role === 'company') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
