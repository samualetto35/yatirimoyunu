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
          <h1>Dashboard</h1>
          <p>Yatırım performansınızı takip edin</p>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card primary">
            <div className="card-header">
              <h3>Portföy Değeri</h3>
              <span className="card-badge positive">+2.5%</span>
            </div>
            <div className="card-value">₺125,450</div>
            <div className="card-details">
              <span>Günlük: +₺3,120</span>
              <span>Haftalık: +₺8,450</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Aktif Yatırımlar</h3>
              <span className="card-badge neutral">5</span>
            </div>
            <div className="card-value">5</div>
            <div className="card-details">
              <span>Hisse: 3</span>
              <span>Kripto: 2</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Ortalama Getiri</h3>
              <span className="card-badge positive">+1.8%</span>
            </div>
            <div className="card-value">%12.4</div>
            <div className="card-details">
              <span>Aylık: %8.2</span>
              <span>Yıllık: %15.6</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Risk Skoru</h3>
              <span className="card-badge warning">Orta</span>
            </div>
            <div className="card-value">6.2/10</div>
            <div className="card-details">
              <span>Volatilite: %18</span>
              <span>Beta: 1.2</span>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section-card">
            <h3>Son İşlemler</h3>
            <div className="transaction-list">
              <div className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-type buy">Alış</span>
                  <span className="transaction-symbol">AAPL</span>
                  <span className="transaction-amount">10 adet</span>
                </div>
                <div className="transaction-details">
                  <span className="transaction-price">₺2,450</span>
                  <span className="transaction-time">14:30</span>
                </div>
              </div>
              <div className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-type sell">Satış</span>
                  <span className="transaction-symbol">BTC</span>
                  <span className="transaction-amount">0.5 BTC</span>
                </div>
                <div className="transaction-details">
                  <span className="transaction-price">₺45,200</span>
                  <span className="transaction-time">12:15</span>
                </div>
              </div>
              <div className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-type buy">Alış</span>
                  <span className="transaction-symbol">TSLA</span>
                  <span className="transaction-amount">5 adet</span>
                </div>
                <div className="transaction-details">
                  <span className="transaction-price">₺1,850</span>
                  <span className="transaction-time">09:45</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3>Piyasa Özeti</h3>
            <div className="market-summary">
              <div className="market-item">
                <span className="market-name">BIST 100</span>
                <span className="market-value">9,245.6</span>
                <span className="market-change positive">+1.2%</span>
              </div>
              <div className="market-item">
                <span className="market-name">S&P 500</span>
                <span className="market-value">4,567.8</span>
                <span className="market-change positive">+0.8%</span>
              </div>
              <div className="market-item">
                <span className="market-name">BTC/USD</span>
                <span className="market-value">$45,200</span>
                <span className="market-change negative">-2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 