import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Eğer kullanıcı giriş yapmışsa Dashboard'a yönlendir
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Giriş yapmamış kullanıcılar için normal landing page
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Yatırım Oyunu</h1>
        <p>Yatırım dünyasını keşfedin ve portföyünüzü yönetin</p>
        <div className="landing-buttons">
          <a href="/login" className="landing-button primary">Giriş Yap</a>
          <a href="/register" className="landing-button secondary">Kayıt Ol</a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 