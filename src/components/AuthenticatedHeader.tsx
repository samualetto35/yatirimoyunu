import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthenticatedHeader.css';
import './IconStyles.css';
import { RefreshIcon, DashboardIcon, PortfolioIcon, TrophyIcon, CommunityIcon, UserIcon } from './Icons';

const AuthenticatedHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // currentUser removed as it's not directly used in JSX

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      navigate('/');
      await logout();
      console.log('User logged out successfully, redirected to home page');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const closeLogoutModal = () => setShowLogoutConfirm(false);

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
                <DashboardIcon size={16} />
                Dashboard
              </button>
              <button 
                className={`auth-nav-item ${isActive('/investments') ? 'active' : ''}`} 
                onClick={() => navigate('/investments')}
              >
                <PortfolioIcon size={16} />
                Yatırımlarım
              </button>
              <button 
                className={`auth-nav-item ${isActive('/ranking') ? 'active' : ''}`} 
                onClick={() => navigate('/ranking')}
              >
                <TrophyIcon size={16} />
                Sıralama
              </button>
              <button 
                className={`auth-nav-item ${isActive('/community') ? 'active' : ''}`} 
                onClick={() => navigate('/community')}
              >
                <CommunityIcon size={16} />
                Topluluk
              </button>
            </nav>
          </div>

          <div className="auth-header-right">
            <button className="refresh-minimal" onClick={() => window.location.reload()}>
              <RefreshIcon size={16} className="refresh-icon" />
              <span className="refresh-label">Yenile</span>
            </button>
            <button className="auth-nav-button" onClick={() => navigate('/user')}>
              <UserIcon size={16} />
              Profil
            </button>
            <button className="auth-nav-button logout" onClick={handleLogoutClick}>
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
              <button className="refresh-minimal" onClick={() => window.location.reload()}>
                <RefreshIcon size={16} className="refresh-icon" />
                <span className="refresh-label">Yenile</span>
              </button>
              <button className="mobile-action-btn profile" onClick={() => navigate('/user')}>
                Profil
              </button>
              <button className="mobile-action-btn logout" onClick={handleLogoutClick}>
                Çıkış
              </button>
            </div>
          </div>

          <div className="mobile-navigation">
            <button 
              className={`mobile-nav-btn ${isActive('/dashboard') ? 'active' : ''}`} 
              onClick={() => navigate('/dashboard')}
            >
              <DashboardIcon size={18} />
              <span className="nav-text">Dashboard</span>
            </button>
            <button 
              className={`mobile-nav-btn ${isActive('/investments') ? 'active' : ''}`} 
              onClick={() => navigate('/investments')}
            >
              <PortfolioIcon size={18} />
              <span className="nav-text">Yatırımlarım</span>
            </button>
            <button 
              className={`mobile-nav-btn ${isActive('/ranking') ? 'active' : ''}`} 
              onClick={() => navigate('/ranking')}
            >
              <TrophyIcon size={18} />
              <span className="nav-text">Sıralama</span>
            </button>
            <button 
              className={`mobile-nav-btn ${isActive('/community') ? 'active' : ''}`} 
              onClick={() => navigate('/community')}
            >
              <CommunityIcon size={18} />
              <span className="nav-text">Topluluk</span>
            </button>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="modal-overlay" onClick={closeLogoutModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Çıkış yapılsın mı?</h3>
              <p>Oturumunuzu kapatmak istediğinizden emin misiniz?</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeLogoutModal}>İptal</button>
                <button className="btn-confirm" onClick={confirmLogout}>Çıkış Yap</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AuthenticatedHeader; 