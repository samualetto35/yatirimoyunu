import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Lütfen e-posta adresinizi girin');
      return;
    }
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await resetPassword(email);
      setSuccess('Şifre sıfırlama e-postası gönderildi! Lütfen e-posta kutunuzu ve spam klasörünüzü kontrol edin.');
    } catch (error: any) {
      setError('Şifre sıfırlama işlemi başarısız: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-bg-login">
      <button className="back-home-btn" onClick={() => navigate('/')}>⟵ Anasayfaya Dön</button>
      <div className="auth-card">
        <h2>Şifremi Unuttum</h2>
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
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 