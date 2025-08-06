import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { currentUser, sendVerificationEmail, createUserRecords } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    console.log('🔍 [VERIFY] VerifyEmail component loaded');
    console.log('👤 [VERIFY] Current user:', currentUser.email);
    console.log('🔍 [VERIFY] Email verified status:', currentUser.emailVerified);

    if (currentUser.emailVerified) {
      console.log('✅ [VERIFY] Email already verified, creating database records...');
      setSuccess('E-posta adresiniz zaten doğrulanmış!');
      // Email doğrulandıysa database kayıtları oluştur
      handleEmailVerified();
      setTimeout(() => {
        navigate('/dashboard'); // /user yerine /dashboard'a yönlendir
      }, 2000);
    } else {
      console.log('⚠️ [VERIFY] Email not yet verified');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailVerified = async () => {
    if (!currentUser) return;
    
    try {
      console.log('✅ [VERIFY] Email verified, creating database records...');
      console.log('👤 [VERIFY] User UID:', currentUser.uid);
      console.log('📧 [VERIFY] User email:', currentUser.email);
      
      await createUserRecords(currentUser.uid, currentUser.email || '');
      console.log('✅ [VERIFY] Database records created successfully');
      
      // Başarı mesajını güncelle
      setSuccess('E-posta doğrulama başarılı! Database kayıtları oluşturuldu.');
      
    } catch (error) {
      console.error('❌ [VERIFY] Error creating database records:', error);
      setError('Database kayıtları oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendLoading(true);
      console.log('Resending verification email');
      
      await sendVerificationEmail();
      setSuccess('Doğrulama e-postası tekrar gönderildi');
      setCountdown(60);
      console.log('Verification email resent successfully');
    } catch (error: any) {
      console.error('Failed to resend verification email:', error.message);
      setError('E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setLoading(true);
      console.log('🔍 [VERIFY] Checking email verification status');
      
      // Reload the user to check verification status
      await currentUser?.reload();
      
      if (currentUser?.emailVerified) {
        console.log('✅ [VERIFY] Email verification confirmed');
        console.log('👤 [VERIFY] User UID:', currentUser.uid);
        console.log('📧 [VERIFY] User email:', currentUser.email);
        
        // Email doğrulandıysa database kayıtları oluştur
        await handleEmailVerified();
        
        setTimeout(() => {
          navigate('/dashboard'); // /user yerine /dashboard'a yönlendir
        }, 2000);
      } else {
        console.log('⚠️ [VERIFY] Email not yet verified');
        setError('E-posta henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.');
      }
    } catch (error: any) {
      console.error('❌ [VERIFY] Error checking verification:', error.message);
      setError('Doğrulama durumu kontrol edilemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="auth-container auth-bg-login">
      <button className="back-home-btn" onClick={() => navigate('/')}>⟵ Anasayfaya Dön</button>
      <div className="auth-card">
        <h2>E-posta Doğrulama</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="verification-info">
          <p>
            <strong>{currentUser.email}</strong> adresine doğrulama e-postası gönderdik.
          </p>
          <p>
            E-postanızı kontrol edin ve doğrulama linkine tıklayın.
          </p>
          <div className="spam-notice">
            <strong>💡 Önemli:</strong> E-posta spam/gereksiz klasörünüzü de kontrol edin!
          </div>
        </div>
        
        <div className="verification-buttons">
          <button 
            type="button" 
            className="auth-button"
            onClick={handleCheckVerification}
            disabled={loading}
          >
            {loading ? 'Kontrol ediliyor...' : 'Doğrulama Durumunu Kontrol Et'}
          </button>
          {success && (
            <button 
              type="button" 
              className="auth-button secondary" 
              onClick={() => navigate('/dashboard')}
            >
              Dashboard'a Git
            </button>
          )}
        </div>
        
        <div className="resend-section">
          <button 
            type="button" 
            className="resend-button" 
            onClick={handleResendEmail}
            disabled={resendLoading || countdown > 0}
          >
            {resendLoading 
              ? 'Gönderiliyor...' 
              : countdown > 0 
                ? `${countdown} saniye sonra tekrar gönder` 
                : 'E-postayı tekrar gönder'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 