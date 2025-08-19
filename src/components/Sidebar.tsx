import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';
import './IconStyles.css';
import { HomeIcon, UserIcon, PortfolioIcon, TrophyIcon, CommunityIcon } from './Icons';

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
            <HomeIcon size={16} />
            Anasayfa
          </button>
          <button className="nav-item" onClick={() => navigate('/user')}>
            <UserIcon size={16} />
            Profil
          </button>
          <button className="nav-item" onClick={() => navigate('/investments')}>
            <PortfolioIcon size={16} />
            Yatırımlarım
          </button>
          <button className="nav-item" onClick={() => navigate('/ranking')}>
            <TrophyIcon size={16} />
            Sıralama
          </button>
          <button className="nav-item" onClick={() => navigate('/community')}>
            <CommunityIcon size={16} />
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
            <HomeIcon size={16} />
            Anasayfa
          </button>
          <button className="mobile-nav-item" onClick={() => navigate('/investments')}>
            <PortfolioIcon size={16} />
            Yatırımlarım
          </button>
          <button className="mobile-nav-item" onClick={() => navigate('/ranking')}>
            <TrophyIcon size={16} />
            Sıralama
          </button>
          <button className="mobile-nav-item" onClick={() => navigate('/community')}>
            <CommunityIcon size={16} />
            Topluluk
          </button>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-nav">
        <button className="mobile-nav-item" onClick={() => navigate('/home')}>
          <HomeIcon size={18} />
          Anasayfa
        </button>
        <button className="mobile-nav-item" onClick={() => navigate('/investments')}>
          <PortfolioIcon size={18} />
          Yatırımlarım
        </button>
        <button className="mobile-nav-item" onClick={() => navigate('/ranking')}>
          <TrophyIcon size={18} />
          Sıralama
        </button>
        <button className="mobile-nav-item" onClick={() => navigate('/community')}>
          <CommunityIcon size={18} />
          Topluluk
        </button>
      </div>
    </>
  );
};

export default Sidebar; 