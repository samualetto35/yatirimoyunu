import React from 'react';
import './Community.css';
import { ConstructionIcon, ChartIcon, ChatIcon, TrophyIcon, BarChartIcon, TargetIcon, RocketIcon } from './Icons';

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
            <ConstructionIcon size={64} />
          </div>
          <h2>Bu sayfa yapım aşamasındadır</h2>
          <p>
            Topluluk özellikleri şu anda geliştirilmektedir. Yakında burada diğer yatırımcılarla 
            etkileşime geçebilecek, stratejilerinizi paylaşabilecek ve deneyimlerinizi tartışabileceksiniz.
          </p>
          <div className="coming-features">
            <h3>Gelecek Özellikler:</h3>
            <ul>
              <li><ChartIcon size={16} /> Yatırım stratejileri paylaşımı</li>
              <li><ChatIcon size={16} /> Canlı sohbet ve tartışma forumu</li>
              <li><TrophyIcon size={16} /> Haftalık başarı hikayeleri</li>
              <li><BarChartIcon size={16} /> Topluluk istatistikleri</li>
              <li><TargetIcon size={16} /> Grup yarışmaları</li>
            </ul>
          </div>
          <div className="construction-footer">
            <p>Güncellemeler için takipte kalın! <RocketIcon size={18} /></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community; 