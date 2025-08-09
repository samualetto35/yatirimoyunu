import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Eğer kullanıcı giriş yapmışsa Dashboard'a yönlendir
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Giriş yapmamış kullanıcılar için landing page
  return (
    <div className="landing-page">
      {/* Hero Image Section */}
      <section className="hero-section">
        <div className="hero-image">
          <img 
            src="/create_an_ultra-realistic_wall_street_trading_floor_scene_as_a_high-resolution_background_image_for_1dgl3xqmc9vmtp3z4oph_0.png" 
            alt="Yatırım ve Finans" 
          />
          <div className="hero-overlay">
            <div className="hero-text">
              <h1>Yatırım Oyunu</h1>
              <p>Gerçek piyasa verilerini kullanarak yatırım stratejilerinizi test edin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Instruments Banner */}
      <section className="instruments-section">
        <div className="container">
          <h2>20'den Fazla Yatırım Paritesi</h2>
          <div className="instruments-grid">
            <div className="instruments-grid-wrapper">
              <div className="instrument-card">
                <div className="instrument-icon red">₺</div>
                <span>Turkish Lira</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon orange">€</div>
                <span>Eurobond</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon gold">Au</div>
                <span>Gold</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon silver">Ag</div>
                <span>Silver</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon dark">WTI</div>
                <span>Oil</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon blue">NASDAQ</div>
                <span>NASDAQ</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon purple">ETH</div>
                <span>Ethereum</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon green">S&P</div>
                <span>S&P 500</span>
              </div>
              {/* Duplicate for seamless loop */}
              <div className="instrument-card">
                <div className="instrument-icon red">₺</div>
                <span>Turkish Lira</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon orange">€</div>
                <span>Eurobond</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon gold">Au</div>
                <span>Gold</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon silver">Ag</div>
                <span>Silver</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon dark">WTI</div>
                <span>Oil</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon blue">NASDAQ</div>
                <span>NASDAQ</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon purple">ETH</div>
                <span>Ethereum</span>
              </div>
              <div className="instrument-card">
                <div className="instrument-icon green">S&P</div>
                <span>S&P 500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Neden Yatırım Oyunu?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Gerçek Piyasa Verileri</h3>
              <p>Canlı borsa verilerini kullanarak gerçekçi yatırım deneyimi yaşayın</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Haftalık Yarışmalar</h3>
              <p>Diğer yatırımcılarla yarışın ve en iyi performansı sergileyin</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Stratejinizi Geliştirin</h3>
              <p>Risk almadan farklı yatırım stratejilerini test edin ve öğrenin</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobil Uyumlu</h3>
              <p>Her yerden portföyünüzü takip edin ve yatırım yapın</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Güvenli Platform</h3>
              <p>Verileriniz Firebase güvenliği ile korunur</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Detaylı Analiz</h3>
              <p>Performansınızı analiz edin ve gelişim gösterin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Yatırım Oyunu</h4>
              <p>Yatırım dünyasını keşfedin ve stratejilerinizi geliştirin</p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><a href="/register">Kayıt Ol</a></li>
                <li><a href="/login">Giriş Yap</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Destek</h4>
              <ul>
                <li><a href="#support">Yardım</a></li>
                <li><a href="#contact">İletişim</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Yatırım Oyunu. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 