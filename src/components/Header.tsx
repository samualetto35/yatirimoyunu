import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      await logout();
      navigate('/');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/') }>
          <h2>Yatırım Oyunu</h2>
        </div>
        <div className="nav-buttons">
          {currentUser ? (
            <button className="nav-button logout" onClick={() => setShowLogoutConfirm(true)}>
              Çıkış Yap
            </button>
          ) : (
            <>
              <button className="nav-button" onClick={() => navigate('/login')}>
                Oturum Aç
              </button>
              <button className="nav-button register" onClick={() => navigate('/register')}>
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Çıkış yapılsın mı?</h3>
            <p>Oturumunuzu kapatmak istediğinizden emin misiniz?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>İptal</button>
              <button className="btn-confirm" onClick={confirmLogout}>Çıkış Yap</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 