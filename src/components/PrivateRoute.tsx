import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'white'
      }}>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 