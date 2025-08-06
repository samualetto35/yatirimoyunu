import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthenticatedHeader.css';

const AuthenticatedHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // currentUser removed as it's not directly used in JSX

  const handleLogout = async () => {
    try {
      // Önce ana sayfaya yönlendir
      navigate('/');
      // Sonra logout işlemini yap
      await logout();
      console.log('User logged out successfully, redirected to home page');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="authenticated-header">
      <div className="auth-header-content">
        {/* Desktop Layout */}
        <div className="auth-header-desktop">
          <div className="auth-header-left">
            <div className="logo" onClick={() => navigate('/')}>
              <h2>Yatırım Oyunu</h2>
            </div>
          </div>

          <div className="auth-header-center">
            <nav className="auth-nav">
              <button 
                className={`auth-nav-item ${isActive('/dashboard') ? 'active' : ''}`} 
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`auth-nav-item ${isActive('/investments') ? 'active' : ''}`} 
                onClick={() => navigate('/investments')}
              >
                Yatırımlarım
              </button>
              <button 
                className={`auth-nav-item ${isActive('/ranking') ? 'active' : ''}`} 
                onClick={() => navigate('/ranking')}
              >
                Sıralama
              </button>
              <button 
                className={`auth-nav-item ${isActive('/community') ? 'active' : ''}`} 
                onClick={() => navigate('/community')}
              >
                Topluluk
              </button>
            </nav>
          </div>

          <div className="auth-header-right">
            <button className="auth-nav-button" onClick={() => navigate('/user')}>
              Profil
            </button>
            <button className="auth-nav-button logout" onClick={handleLogout}>
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Mobile Layout - Yeni Tasarım */}
        <div className="auth-header-mobile">
          <div className="mobile-header-main">
            <div className="mobile-logo" onClick={() => navigate('/')}>
              <h2>Yatırım Oyunu</h2>
            </div>
            <div className="mobile-actions">
              <button className="mobile-action-btn profile" onClick={() => navigate('/user')}>
                Profil
              </button>
              <button className="mobile-action-btn logout" onClick={handleLogout}>
                Çıkış
              </button>
            </div>
          </div>

          <div className="mobile-navigation">
            <button 
              className={`mobile-nav-btn ${isActive('/dashboard') ? 'active' : ''}`} 
              onClick={() => navigate('/dashboard')}
            >
              <span className="nav-text">Dashboard</span>
            </button>
            <button 
              className={`mobile-nav-btn ${isActive('/investments') ? 'active' : ''}`} 
              onClick={() => navigate('/investments')}
            >
              <span className="nav-text">Yatırımlarım</span>
            </button>
            <button 
              className={`mobile-nav-btn ${isActive('/ranking') ? 'active' : ''}`} 
              onClick={() => navigate('/ranking')}
            >
              <span className="nav-text">Sıralama</span>
            </button>
            <button 
              className={`mobile-nav-btn ${isActive('/community') ? 'active' : ''}`} 
              onClick={() => navigate('/community')}
            >
              <span className="nav-text">Topluluk</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthenticatedHeader; 