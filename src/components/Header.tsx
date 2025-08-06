import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
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
        <div className="logo" onClick={() => navigate('/')}>
          <h2>Yatırım Oyunu</h2>
        </div>
        <div className="nav-buttons">
          {currentUser ? (
            <button className="nav-button logout" onClick={handleLogout}>
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
    </header>
  );
};

export default Header; 