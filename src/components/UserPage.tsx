import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserPage.css';

const UserPage: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="user-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="user-page">
      <div className="user-content">
        <div className="user-header">
          <h1>Profil</h1>
          <p>Hesap bilgilerinizi görüntüleyin</p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {currentUser.email?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">E-posta</span>
              <span className="info-value">{currentUser.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Hesap Durumu</span>
              <span className={`status-badge ${currentUser.emailVerified ? 'verified' : 'unverified'}`}>
                {currentUser.emailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Üyelik Tarihi</span>
              <span className="info-value">
                {currentUser.metadata.creationTime ? 
                  formatDate(currentUser.metadata.creationTime) : 'Bilinmiyor'}
              </span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="logout-button" onClick={handleLogout}>
            <span className="button-icon">🚪</span>
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage; 