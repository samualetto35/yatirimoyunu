import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';

const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Eğer kullanıcı giriş yapmışsa /home'a yönlendir
    if (currentUser) {
      console.log('User is logged in, redirecting to /home');
      navigate('/home');
    }
  }, [currentUser, navigate]);

  // Eğer kullanıcı giriş yapmışsa loading göster
  if (currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'white'
      }}>
        <div>Yönlendiriliyor...</div>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar için landing page
  return (
    <div className="App">
      <Header />
      <div className="content">
        <h1>Yatırım Oyunu'na Hoş Geldiniz</h1>
        <p>Başlamak için giriş yapın veya kayıt olun.</p>
      </div>
    </div>
  );
};

export default LandingPage; 