import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!currentUser) {
    return null; // PrivateRoute zaten kontrol ediyor
  }

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="welcome-section">
          <h1>Hoş Geldiniz, {currentUser.email}!</h1>
          <p>Yatırım oyununa başlamak için hazırsınız.</p>
        </div>
        
        <div className="user-info-card">
          <h3>👤 Hesap Bilgileri</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>E-posta:</strong>
              <span>{currentUser.email}</span>
            </div>
            <div className="info-item">
              <strong>Kullanıcı ID:</strong>
              <span className="user-id">{currentUser.uid}</span>
            </div>
            <div className="info-item">
              <strong>E-posta Doğrulandı:</strong>
              <span className={currentUser.emailVerified ? 'verified' : 'not-verified'}>
                {currentUser.emailVerified ? '✅ Evet' : '❌ Hayır'}
              </span>
            </div>
            <div className="info-item">
              <strong>Hesap Oluşturulma:</strong>
              <span>
                {currentUser.metadata.creationTime ? 
                  new Date(currentUser.metadata.creationTime).toLocaleDateString('tr-TR') : 
                  'Bilinmiyor'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button primary" onClick={() => window.location.href = '/user'}>
            🎯 Kullanıcı Sayfasına Git
          </button>
          <button className="action-button secondary" onClick={handleLogout}>
            🚪 Çıkış Yap
          </button>
        </div>

        <div className="features-section">
          <h3>🚀 Özellikler</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>📊 Yatırım Takibi</h4>
              <p>Yatırım portföyünüzü takip edin ve performansınızı analiz edin.</p>
            </div>
            <div className="feature-card">
              <h4>📈 Market Verileri</h4>
              <p>Gerçek zamanlı market verileri ile bilinçli yatırım kararları alın.</p>
            </div>
            <div className="feature-card">
              <h4>🔒 Güvenli Sistem</h4>
              <p>Firebase ve Supabase ile güvenli ve ölçeklenebilir altyapı.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 