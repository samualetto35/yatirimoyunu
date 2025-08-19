import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';
import { EyeIcon, EyeOffIcon, ArrowLeftIcon } from './Icons';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      console.log('Registration attempt for:', email);
      
      await register(email, password);
      setSuccess('Kayıt başarılı! E-posta doğrulama linki gönderildi.');
      console.log('Registration successful, verification email sent');
      
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error.message);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi';
      case 'auth/weak-password':
        return 'Şifre çok zayıf';
      case 'auth/operation-not-allowed':
        return 'E-posta/şifre girişi devre dışı';
      default:
        return 'Kayıt olurken bir hata oluştu';
    }
  };

  return (
    <div className="auth-container auth-bg-register">
      <button className="back-home-btn" onClick={() => navigate('/')}>
        <ArrowLeftIcon size={16} />
        Anasayfaya Dön
      </button>
      <div className="auth-card">
        <h2>Kayıt Ol</h2>
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
                placeholder="En az 6 karakter"
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifrenizi tekrar girin"
                required
                style={{ borderColor: confirmPassword.length > 0 ? (passwordsMatch ? '#28a745' : '#dc3545') : undefined }}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div style={{ fontSize: '0.92rem', marginTop: '0.3rem', color: passwordsMatch ? '#28a745' : '#dc3545' }}>
                {passwordsMatch ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor'}
              </div>
            )}
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Zaten hesabınız var mı? Giriş yapın</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 