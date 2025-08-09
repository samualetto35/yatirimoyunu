import React from 'react';
import './Community.css';

const Community: React.FC = () => {
  return (
    <div className="community-page">
      <div className="community-content">
        <div className="community-header">
          <h1>Topluluk</h1>
          <p>Diğer yatırımcılarla etkileşime geçin</p>
        </div>

        <div className="construction-card">
          <div className="construction-icon">
            🚧
          </div>
          <h2>Bu sayfa yapım aşamasındadır</h2>
          <p>
            Topluluk özellikleri şu anda geliştirilmektedir. Yakında burada diğer yatırımcılarla 
            etkileşime geçebilecek, stratejilerinizi paylaşabilecek ve deneyimlerinizi tartışabileceksiniz.
          </p>
          <div className="coming-features">
            <h3>Gelecek Özellikler:</h3>
            <ul>
              <li>📈 Yatırım stratejileri paylaşımı</li>
              <li>💬 Canlı sohbet ve tartışma forumu</li>
              <li>🏆 Haftalık başarı hikayeleri</li>
              <li>📊 Topluluk istatistikleri</li>
              <li>🎯 Grup yarışmaları</li>
            </ul>
          </div>
          <div className="construction-footer">
            <p>Güncellemeler için takipte kalın! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 