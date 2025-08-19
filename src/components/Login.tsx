import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from './Icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      console.log('Login successful, navigating to dashboard');
      navigate('/dashboard'); // /user yerine /dashboard'a yönlendir
    } catch (error: any) {
      console.error('Login failed:', error.message);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      case 'auth/wrong-password':
        return 'Hatalı şifre';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi';
      case 'auth/user-disabled':
        return 'Bu hesap devre dışı bırakılmış';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
      case 'auth/email-not-verified':
        return 'E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu ve spam klasörünüzü kontrol edin.';
      default:
        return 'Giriş yapılırken bir hata oluştu';
    }
  };

  return (
    <div className="auth-container auth-bg-login">
      <button className="back-home-btn" onClick={() => navigate('/')}>
        <ArrowLeftIcon size={16} />
        Anasayfaya Dön
      </button>
      <div className="auth-card">
        <h2>Oturum Aç</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
          <button 
            type="button" 
            className="forgot-password-btn" 
            onClick={() => navigate('/forgot-password')}
          >
            Şifremi Unuttum
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/register">Hesabınız yok mu? Kayıt olun</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 