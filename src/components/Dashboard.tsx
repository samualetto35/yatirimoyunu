import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null; // PrivateRoute zaten kontrol ediyor
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <p>Yatırım performansınızı takip edin</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>💰 Toplam Bakiye</h3>
            <div className="card-value">₺100,000</div>
            <div className="card-change positive">+2.5%</div>
          </div>
          
          <div className="dashboard-card">
            <h3>📈 Günlük Kazanç</h3>
            <div className="card-value">₺2,500</div>
            <div className="card-change positive">+1.8%</div>
          </div>
          
          <div className="dashboard-card">
            <h3>📊 Aktif Yatırımlar</h3>
            <div className="card-value">5</div>
            <div className="card-change neutral">Stabil</div>
          </div>
          
          <div className="dashboard-card">
            <h3>🏆 Sıralama</h3>
            <div className="card-value">#42</div>
            <div className="card-change positive">+3</div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>🕒 Son Aktiviteler</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">14:30</span>
              <span className="activity-text">Yeni yatırım eklendi: Apple Inc.</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">12:15</span>
              <span className="activity-text">Portföy güncellendi</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">09:45</span>
              <span className="activity-text">Günlük rapor oluşturuldu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 