import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import './UserPage.css';

const UserPage: React.FC = () => {
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    console.log('User page loaded for:', currentUser?.email);
    
    // Kullanıcı sayfası yüklendiğinde otomatik olarak kayıtları kontrol et
    if (currentUser) {
      console.log('🔍 [AUTO] Automatically checking user records on page load...');
      setTimeout(async () => {
        await checkUserRecords();
      }, 500);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 [TEST] Testing Supabase connection...');
      await DatabaseService.testSupabaseConnection();
      console.log('✅ [TEST] Supabase connection test completed');
    } catch (error) {
      console.error('❌ [TEST] Supabase connection test failed:', error);
    }
  };

  const checkUserRecords = async () => {
    if (!currentUser) return;
    
    try {
      console.log('🧪 [TEST] Checking user records...');
      console.log('👤 [TEST] User UID:', currentUser.uid);
      console.log('📧 [TEST] User email:', currentUser.email);
      
      const progress = await DatabaseService.getUserProgress(currentUser.uid);
      const entries = await DatabaseService.getUserEntries(currentUser.uid);
      
      console.log('✅ [TEST] User progress:', progress);
      console.log('✅ [TEST] User entries:', entries);
      
      // Kayıtlar varsa başarı mesajı göster
      if (progress && entries) {
        console.log('🎉 [TEST] Both user_progress and user_entries records found!');
      } else if (progress) {
        console.log('⚠️ [TEST] Only user_progress record found, user_entries missing');
      } else if (entries) {
        console.log('⚠️ [TEST] Only user_entries record found, user_progress missing');
      } else {
        console.log('❌ [TEST] No records found for user');
      }
      
    } catch (error) {
      console.error('❌ [TEST] Error checking user records:', error);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-page">
      <h1>Kullanıcı Sayfası</h1>
      <div className="user-info">
        <p><strong>E-posta:</strong> {currentUser.email}</p>
        <p><strong>Kullanıcı ID:</strong> {currentUser.uid}</p>
        <p><strong>E-posta Doğrulandı:</strong> {currentUser.emailVerified ? 'Evet' : 'Hayır'}</p>
        <p><strong>Hesap Oluşturulma:</strong> {currentUser.metadata.creationTime ? 
          new Date(currentUser.metadata.creationTime).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
      </div>
      
      <div className="security-info">
        <h3>🔒 Güvenlik Bilgileri</h3>
        <p>• Bu sayfa sadece giriş yapmış kullanıcılar tarafından görülebilir</p>
        <p>• Verileriniz Firebase UID ile güvenli şekilde filtreleniyor</p>
        <p>• Her kullanıcı sadece kendi verilerini görebilir</p>
        <p>• URL: <code>/user</code> (her kullanıcı için aynı, güvenli)</p>
        <div className="account-info">
          <h4>👤 Hesap Bilgileri</h4>
          <p><strong>Firebase UID:</strong> <code>{currentUser.uid}</code></p>
          <p><strong>E-posta:</strong> {currentUser.email}</p>
          <p><strong>Hesap Durumu:</strong> {currentUser.emailVerified ? '✅ Doğrulanmış' : '❌ Doğrulanmamış'}</p>
          <p><strong>Oluşturulma:</strong> {currentUser.metadata.creationTime ? 
            new Date(currentUser.metadata.creationTime).toLocaleString('tr-TR') : 'Bilinmiyor'}</p>
        </div>
      </div>
      
      <button onClick={handleLogout} className="logout-button">
        Çıkış Yap
      </button>

      {/* Test Butonları */}
      <div className="test-section">
        <h3>Test İşlemleri</h3>
        <div className="test-buttons">
          <button className="test-button" onClick={testSupabaseConnection}>
            Supabase Bağlantısını Test Et
          </button>
          <button className="test-button" onClick={checkUserRecords}>
            Kullanıcı Kayıtlarını Kontrol Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage; 