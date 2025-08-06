import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null; // Sidebar sadece giriş yapmış kullanıcılar için
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar">
        <div className="nav-section">
          <button className="nav-item" onClick={() => navigate('/home')}>
            Anasayfa
          </button>
          <button className="nav-item" onClick={() => navigate('/user')}>
            Profil
          </button>
          <button className="nav-item" onClick={() => navigate('/investments')}>
            Yatırımlarım
          </button>
          <button className="nav-item" onClick={() => navigate('/ranking')}>
            Sıralama
          </button>
          <button className="nav-item" onClick={() => navigate('/community')}>
            Topluluk
          </button>
        </div>
      </div>
      
      {/* Mobile Second Header */}
      <div className="mobile-second-header">
        <div className="mobile-user-info">
          <div className="mobile-user-email">{currentUser.email}</div>
          <button className="mobile-profile-btn" onClick={() => navigate('/user')}>
            Profil
          </button>
        </div>
        <div className="mobile-nav-section">
          <button className="mobile-nav-item" onClick={() => navigate('/home')}>
            Anasayfa
          </button>
          <button className="mobile-nav-item" onClick={() => navigate('/investments')}>
            Yatırımlarım
          </button>
          <button className="mobile-nav-item" onClick={() => navigate('/ranking')}>
            Sıralama
          </button>
          <button className="mobile-nav-item" onClick={() => navigate('/community')}>
            Topluluk
          </button>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav">
        <button className="mobile-nav-item" onClick={() => navigate('/home')}>
          Anasayfa
        </button>
        <button className="mobile-nav-item" onClick={() => navigate('/investments')}>
          Yatırımlarım
        </button>
        <button className="mobile-nav-item" onClick={() => navigate('/ranking')}>
          Sıralama
        </button>
        <button className="mobile-nav-item" onClick={() => navigate('/community')}>
          Topluluk
        </button>
      </div>
    </>
  );
};

export default Sidebar; 