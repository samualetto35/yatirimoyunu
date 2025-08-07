import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import './Dashboard.css';

const isMobile = () => window.innerWidth <= 768;

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [portfolioValue, setPortfolioValue] = useState<number | null>(null);
  const [previousPortfolioValue, setPreviousPortfolioValue] = useState<number | null>(null);
  const [progressState, setProgressState] = useState<any>(null);
  const [activePoint, setActivePoint] = useState<{ idx: number, val: number, left: string, bottom: string } | null>(null);
  const [showInvestmentPanel, setShowInvestmentPanel] = useState(false);
  
  // Investment Panel States
  const [marketData, setMarketData] = useState<any[]>([]);
  const [selections, setSelections] = useState<{id: number, percentage: number}[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Tümü');
  const [activeWeek, setActiveWeek] = useState<number>(1);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUser) return;
      const progress = await DatabaseService.getUserProgress(currentUser.uid);
      if (progress) {
        setProgressState(progress);
        // Sıralı olarak en sağdaki ve bir önceki dolu değeri bul
        const fields = [
          progress.t7stl,
          progress.t6stl,
          progress.t5stl,
          progress.t4stl,
          progress.t3stl,
          progress.t2stl,
          progress.t1stl,
          progress.t0stl,
          progress.t0btl // t0btl her zaman dolu, en başta
        ];
        const idx = fields.findIndex(v => v !== null && v !== undefined);
        const value = fields[idx] ?? progress.t0btl;
        const prevValue = fields[idx + 1] ?? progress.t0btl;
        setPortfolioValue(value);
        setPreviousPortfolioValue(prevValue);
      }
    };
    fetchProgress();
    
    // 15 saniyede bir otomatik refresh
    const interval = setInterval(fetchProgress, 15000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Investment Panel Functions
  useEffect(() => {
    if (showInvestmentPanel) {
      fetchMarketData();
      fetchActiveWeek();
    }
  }, [showInvestmentPanel]);

  const fetchActiveWeek = async () => {
    try {
      const week = await DatabaseService.getActiveWeek();
      if (week) {
        setActiveWeek(week);
      }
    } catch (err) {
      console.error('❌ [DASHBOARD] Error fetching active week:', err);
    }
  };

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      const data = await DatabaseService.getMarketData();
      
      setMarketData(data || []);
      setSelections([]);
      setTotalPercentage(0);
      setError('');
    } catch (err) {
      console.error('❌ [INVESTMENT] Error fetching market data:', err);
      setError(`Market verileri yüklenemedi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (id: number, percentage: number) => {
    const newSelections = [...selections];
    const existingIndex = newSelections.findIndex(s => s.id === id);
    
    if (existingIndex >= 0) {
      newSelections[existingIndex].percentage = percentage;
    } else {
      newSelections.push({ id, percentage });
    }
    
    // 0 olan seçimleri kaldır
    const filteredSelections = newSelections.filter(s => s.percentage > 0);
    setSelections(filteredSelections);
    
    const total = filteredSelections.reduce((sum, s) => sum + s.percentage, 0);
    setTotalPercentage(total);
  };

  const handleSubmit = async () => {
    if (totalPercentage !== 100) {
      setError('Toplam yüzde %100 olmalıdır');
      return;
    }

    if (selections.length === 0) {
      setError('En az bir yatırım seçmelisiniz');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Aktif haftayı kontrol et
      const activeWeek = await DatabaseService.getActiveWeek();
      
      if (!activeWeek) {
        setError('Aktif hafta bulunamadı');
        return;
      }

      // Seçimleri formatla: "3;0.5 9;0.5"
      const formattedSelections = selections
        .map(s => `${s.id};${s.percentage / 100}`)
        .join(' ');

      // User entries'i güncelle
      await DatabaseService.updateUserEntries(currentUser!.uid, {
        [`t${activeWeek - 1}percent`]: formattedSelections
      });

      setSuccess('Yatırım seçiminiz başarıyla kaydedildi!');
      setTimeout(() => {
        setShowInvestmentPanel(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('❌ [INVESTMENT] Error in handleSubmit:', err);
      setError(`Yatırım seçimi kaydedilemedi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // PrivateRoute zaten kontrol ediyor
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mobilde x-axis için kısa numaralar
  const xAxisLabels = isMobile()
    ? ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.']
    : ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta', '7. Hafta', '8. Hafta'];

  // Yüzdelik değişim hesaplama
  let percentChange: number | null = null;
  let percentClass = 'positive';
  if (portfolioValue !== null) {
    percentChange = ((portfolioValue - 100000) / 100000) * 100;
    if (percentChange > 0) percentClass = 'positive';
    else if (percentChange < 0) percentClass = 'negative';
    else percentClass = 'neutral';
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Yatırım portföyünüzün genel durumu</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card primary" onClick={() => scrollToSection('portfoy-degeri')}>
            <div className="card-header">
              <h3>Portföy Değeri</h3>
              <span className={`card-badge ${percentClass}`}>{percentChange !== null ? `${percentChange > 0 ? '+' : percentChange < 0 ? '' : ''}${percentChange.toFixed(2)}%` : '...'}</span>
            </div>
            <div className="card-value">{portfolioValue !== null ? `₺${portfolioValue.toLocaleString('tr-TR')}` : '...'}</div>
            <div className="card-details card-details-row">
              <div>
                <span className={
                  portfolioValue !== null && previousPortfolioValue !== null
                    ? (portfolioValue - previousPortfolioValue) > 0
                      ? 'value-positive'
                      : (portfolioValue - previousPortfolioValue) < 0
                        ? 'value-negative'
                        : ''
                    : ''
                }>
                  {portfolioValue !== null && previousPortfolioValue !== null ? `${(portfolioValue - previousPortfolioValue) > 0 ? '+' : ''}₺${(portfolioValue - previousPortfolioValue).toLocaleString('tr-TR')}` : '...'}
                </span>
                <span>Bu hafta</span>
              </div>
              <div>
                <span className={
                  portfolioValue !== null
                    ? (portfolioValue - 100000) > 0
                      ? 'value-positive'
                      : (portfolioValue - 100000) < 0
                        ? 'value-negative'
                        : ''
                    : ''
                }>
                  {portfolioValue !== null ? `${(portfolioValue - 100000) > 0 ? '+' : ''}₺${(portfolioValue - 100000).toLocaleString('tr-TR')}` : '...'}
                </span>
                <span>Tüm zamanlar</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card" onClick={() => scrollToSection('aktif-yatirimlar')}>
            <div className="card-header">
              <h3>Aktif Yatırımlar</h3>
              <span className="card-badge neutral">8</span>
            </div>
            <div className="card-value">₺98,200</div>
            <div className="card-details">
              <span>₺27,250</span>
              <span>Nakit</span>
            </div>
          </div>

          <div className="dashboard-card" onClick={() => scrollToSection('ortalama-getiri')}>
            <div className="card-header">
              <h3>Ortalama Getiri</h3>
              <span className="card-badge positive">+8.2%</span>
            </div>
            <div className="card-value">₺9,850</div>
            <div className="card-details">
              <span>+₺750</span>
              <span>Bu ay</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Risk Skoru</h3>
              <span className="card-badge warning">Orta</span>
            </div>
            <div className="card-value">6.8/10</div>
            <div className="card-details">
              <span>-0.2</span>
              <span>Bu hafta</span>
            </div>
          </div>
        </div>

        {/* Yatırım Ekle Butonu */}
        <div className="investment-add-section">
          <button 
            className="investment-add-btn" 
            onClick={() => {
              console.log('🔍 [DASHBOARD] Investment button clicked');
              console.log('🔍 [DASHBOARD] Current showInvestmentPanel state:', showInvestmentPanel);
              setShowInvestmentPanel(!showInvestmentPanel);
              console.log('🔍 [DASHBOARD] Set showInvestmentPanel to:', !showInvestmentPanel);
            }}
          >
            <span className="add-icon">+</span>
            <span className="add-text">Yatırım Ekle</span>
          </button>
        </div>

        {/* Aktif Hafta Bilgisi */}
        {showInvestmentPanel && (
          <div className="active-week-display">
            <span className="week-number">{activeWeek}. Hafta</span> için görüntüleniyor
          </div>
        )}

        {/* Açılır Yatırım Paneli */}
        {showInvestmentPanel && (
          <div className="investment-panel">
            <div className="panel-header">
              <h3>Yatırım Seçimi</h3>
              <button className="panel-close" onClick={() => setShowInvestmentPanel(false)}>×</button>
            </div>

            <div className="panel-content">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {/* Arama Inputu */}
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Yatırım Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Yatay Kaydırmalı Filtre Kutuları */}
              <div className="filter-section">
                <div className="filter-scroll">
                  <button
                    className={`filter-btn ${selectedGroup === 'Tümü' ? 'active' : ''}`}
                    onClick={() => setSelectedGroup('Tümü')}
                  >
                    Tümü
                  </button>
                  {Array.from(new Set(marketData.map(item => item.yatirim_grubu))).map(group => (
                    <button
                      key={group}
                      className={`filter-btn ${selectedGroup === group ? 'active' : ''}`}
                      onClick={() => setSelectedGroup(group)}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Yüzde Bilgisi */}
              <div className="percentage-info">
                <span>Toplam: {totalPercentage}%</span>
                {totalPercentage > 100 && <span className="error">%100'ü geçemez!</span>}
                {totalPercentage < 100 && <span className="warning">%100 olmalı</span>}
              </div>

              {/* Yatırım Listesi */}
              <div className="investment-list">
                {loading ? (
                  <div className="loading">Market verileri yükleniyor...</div>
                ) : marketData.length === 0 ? (
                  <div className="loading">Market verisi bulunamadı. Lütfen daha sonra tekrar deneyin.</div>
                ) : (
                  marketData
                    .filter(item => {
                      const matchesSearch = item.yatirim_araci_kod.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          item.yatirim_araci.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = selectedGroup === 'Tümü' || item.yatirim_grubu === selectedGroup;
                      return matchesSearch && matchesFilter;
                    })
                    .map(item => {
                      const selection = selections.find(s => s.id === item.id);
                      const percentage = selection?.percentage || 0;

                      return (
                        <div key={item.id} className="investment-item">
                          <div className="item-info">
                            <div className="item-code">{item.yatirim_araci_kod}</div>
                            <div className="item-details">
                              <div className="item-name">{item.yatirim_araci}</div>
                              <div className="item-currency">{item.baz_cur}</div>
                            </div>
                          </div>
                          <div className="percentage-input">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={percentage}
                              onChange={(e) => handlePercentageChange(item.id, Number(e.target.value))}
                              placeholder="%"
                              className={percentage > 0 ? 'has-value' : ''}
                            />
                            <span className="percentage-symbol">%</span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            <div className="panel-footer">
              <button className="btn-cancel" onClick={() => setShowInvestmentPanel(false)}>
                İptal
              </button>
              <button 
                className="btn-submit" 
                onClick={handleSubmit}
                disabled={loading || totalPercentage !== 100 || selections.length === 0}
              >
                {loading ? 'Kaydediliyor...' : 'Yatırımı Kaydet'}
              </button>
            </div>
          </div>
        )}

        <div className="dashboard-sections">
          <div className="section-card">
            <h3>Son İşlemler</h3>
            <div className="transaction-list">
              <div className="transaction-item">
                <div className="transaction-type buy">Alış</div>
                <div className="transaction-info">
                  <div className="transaction-symbol">THYAO</div>
                  <div className="transaction-amount">100 adet</div>
                </div>
                <div className="transaction-details">
                  <div className="transaction-price">₺45.20</div>
                  <div className="transaction-time">2 saat önce</div>
                </div>
              </div>
              <div className="transaction-item">
                <div className="transaction-type sell">Satış</div>
                <div className="transaction-info">
                  <div className="transaction-symbol">GARAN</div>
                  <div className="transaction-amount">50 adet</div>
                </div>
                <div className="transaction-details">
                  <div className="transaction-price">₺32.80</div>
                  <div className="transaction-time">1 gün önce</div>
                </div>
              </div>
              <div className="transaction-item">
                <div className="transaction-type buy">Alış</div>
                <div className="transaction-info">
                  <div className="transaction-symbol">ASELS</div>
                  <div className="transaction-amount">200 adet</div>
                </div>
                <div className="transaction-details">
                  <div className="transaction-price">₺28.50</div>
                  <div className="transaction-time">3 gün önce</div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3>Piyasa Özeti</h3>
            <div className="market-summary">
              <div className="market-item">
                <div className="market-name">BIST 100</div>
                <div className="market-value">₺8,245.30</div>
                <div className="market-change positive">+1.2%</div>
              </div>
              <div className="market-item">
                <div className="market-name">Dolar/TL</div>
                <div className="market-value">₺31.85</div>
                <div className="market-change negative">-0.8%</div>
              </div>
              <div className="market-item">
                <div className="market-name">Altın</div>
                <div className="market-value">₺2,145.50</div>
                <div className="market-change positive">+0.5%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Detaylı Section'lar */}
        <div id="portfoy-degeri" className="detail-section">
          <div className="section-card">
            <h3>Portföy Değeri Grafiği</h3>
            <div className="chart-container">
              <div className="chart">
                <div className="chart-axis">
                  {/* Dinamik y-axis */}
                  {(() => {
                    let progressData: number[] = [];
                    if (progressState) {
                      progressData = [
                        progressState.t0btl,
                        progressState.t0stl,
                        progressState.t1stl,
                        progressState.t2stl,
                        progressState.t3stl,
                        progressState.t4stl,
                        progressState.t5stl,
                        progressState.t6stl,
                        progressState.t7stl,
                      ].filter(v => v !== null && v !== undefined);
                    }
                    const minY = Math.min(0, ...progressData);
                    const maxY = Math.max(200000, ...progressData);
                    const step = (maxY - minY) / 4;
                    const yLabels = Array.from({ length: 5 }, (_, i) => Math.round(maxY - i * step));
                    return (
                      <div className="y-axis">
                        {yLabels.map((val, i) => (
                          <span key={i}>₺{val.toLocaleString('tr-TR')}</span>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="chart-area">
                    {/* Dikey noktalı çizgiler */}
                    <div className="vertical-grid">
                      <div className="grid-line" style={{ left: '0%' }}></div>
                      <div className="grid-line" style={{ left: '12.5%' }}></div>
                      <div className="grid-line" style={{ left: '25%' }}></div>
                      <div className="grid-line" style={{ left: '37.5%' }}></div>
                      <div className="grid-line" style={{ left: '50%' }}></div>
                      <div className="grid-line" style={{ left: '62.5%' }}></div>
                      <div className="grid-line" style={{ left: '75%' }}></div>
                      <div className="grid-line" style={{ left: '87.5%' }}></div>
                    </div>
                    
                    {/* Gerçek veri noktaları ve çizgisi */}
                    <div className="chart-line">
                      {(() => {
                        // progressData: t0btl, t0stl, t1stl, ... t7stl
                        let progressData: {val: number, idx: number}[] = [];
                        if (progressState) {
                          const rawData = [
                            progressState.t0btl,
                            progressState.t0stl,
                            progressState.t1stl,
                            progressState.t2stl,
                            progressState.t3stl,
                            progressState.t4stl,
                            progressState.t5stl,
                            progressState.t6stl,
                            progressState.t7stl,
                          ];
                          progressData = rawData
                            .map((v, idx) => (v !== null && v !== undefined ? { val: v, idx } : null))
                            .filter(Boolean) as {val: number, idx: number}[];
                        }
                        const maxY = 200000;
                        // Nokta koordinatlarını hesapla
                        const pointCoords = progressData.map(({val, idx}) => {
                          const x = (idx / 8) * 100;
                          const y = 100 - Math.max(0, Math.min(100, (val / maxY) * 100));
                          return { x, y, val, idx };
                        });
                        return (
                          <>
                            {/* Düz çizgiler */}
                            <svg className="chart-svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                              {pointCoords.map((point, i) => {
                                if (i === 0) return null; // İlk nokta için çizgi yok
                                const prevPoint = pointCoords[i - 1];
                                return (
                                  <line
                                    key={`line-${i}`}
                                    x1={prevPoint.x}
                                    y1={prevPoint.y}
                                    x2={point.x}
                                    y2={point.y}
                                    stroke="#14669A"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    opacity="0.85"
                                  />
                                );
                              })}
                            </svg>
                            {/* Noktalar */}
                            {pointCoords.map(({val, idx, x, y}) => {
                              const left = `${x}%`;
                              const bottom = `${100 - y}%`;
                              return (
                                <div
                                  key={idx}
                                  className="chart-point"
                                  style={{ left, bottom }}
                                  onMouseEnter={() => setActivePoint({ idx, val, left, bottom })}
                                  onMouseLeave={() => setActivePoint(null)}
                                  onTouchStart={() => setActivePoint({ idx, val, left, bottom })}
                                  onTouchEnd={() => setActivePoint(null)}
                                  onClick={() => setActivePoint({ idx, val, left, bottom })}
                                ></div>
                              );
                            })}
                            {/* Tooltip */}
                            {activePoint && (
                              <div
                                className="chart-tooltip"
                                style={{ left: activePoint.left, bottom: `calc(${activePoint.bottom} + 24px)` }}
                              >
                                <div className="tooltip-week">{activePoint.idx + 1}. Hafta</div>
                                <div className="tooltip-value">₺{activePoint.val.toLocaleString('tr-TR')}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    
                    <div className="x-axis">
                      <span>1. Hafta</span>
                      <span>2. Hafta</span>
                      <span>3. Hafta</span>
                      <span>4. Hafta</span>
                      <span>5. Hafta</span>
                      <span>6. Hafta</span>
                      <span>7. Hafta</span>
                      <span>8. Hafta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="ortalama-getiri" className="detail-section">
          <div className="section-card">
            <h3>Ortalama Haftalık Getiri</h3>
            <div className="chart-container">
              <div className="chart">
                <div className="chart-axis">
                  <div className="y-axis">
                    <span>+15%</span>
                    <span>+10%</span>
                    <span>+5%</span>
                    <span>0%</span>
                    <span>-5%</span>
                    <span>-10%</span>
                  </div>
                  <div className="chart-area">
                    <div className="chart-line negative">
                      <div className="chart-point" style={{ left: '0%', bottom: '50%' }}></div>
                      <div className="chart-point" style={{ left: '14.28%', bottom: '60%' }}></div>
                      <div className="chart-point" style={{ left: '28.57%', bottom: '40%' }}></div>
                      <div className="chart-point" style={{ left: '42.85%', bottom: '70%' }}></div>
                      <div className="chart-point" style={{ left: '57.14%', bottom: '30%' }}></div>
                      <div className="chart-point" style={{ left: '71.42%', bottom: '80%' }}></div>
                      <div className="chart-point" style={{ left: '85.71%', bottom: '20%' }}></div>
                      <div className="chart-point" style={{ left: '100%', bottom: '90%' }}></div>
                    </div>
                    <div className="x-axis">
                      {xAxisLabels.map((label, idx) => (
                        <span key={idx}>
                          {label}
                          {isMobile() && idx === 7 && (
                            <span className="x-axis-hafta"> hafta</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>1. Hafta</th>
                    <th>2. Hafta</th>
                    <th>3. Hafta</th>
                    <th>4. Hafta</th>
                    <th>5. Hafta</th>
                    <th>6. Hafta</th>
                    <th>7. Hafta</th>
                    <th>8. Hafta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0%</td>
                    <td>+2.5%</td>
                    <td>-1.2%</td>
                    <td>+4.8%</td>
                    <td>-2.1%</td>
                    <td>+6.3%</td>
                    <td>-3.4%</td>
                    <td>+8.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="aktif-yatirimlar" className="detail-section">
          <div className="section-card">
            <h3>Aktif Yatırımlar Detayı</h3>
            <div className="investments-grid">
              <div className="investment-item">
                <div className="investment-header">
                  <h4>THYAO</h4>
                  <span className="investment-change positive">+5.2%</span>
                </div>
                <div className="investment-details">
                  <div className="investment-amount">100 adet</div>
                  <div className="investment-value">₺4,520</div>
                  <div className="investment-profit">+₺220</div>
                </div>
              </div>
              <div className="investment-item">
                <div className="investment-header">
                  <h4>GARAN</h4>
                  <span className="investment-change negative">-1.8%</span>
                </div>
                <div className="investment-details">
                  <div className="investment-amount">150 adet</div>
                  <div className="investment-value">₺4,920</div>
                  <div className="investment-profit negative">-₺90</div>
                </div>
              </div>
              <div className="investment-item">
                <div className="investment-header">
                  <h4>ASELS</h4>
                  <span className="investment-change positive">+3.4%</span>
                </div>
                <div className="investment-details">
                  <div className="investment-amount">200 adet</div>
                  <div className="investment-value">₺5,700</div>
                  <div className="investment-profit">+₺190</div>
                </div>
              </div>
              <div className="investment-item">
                <div className="investment-header">
                  <h4>KRDMD</h4>
                  <span className="investment-change positive">+7.1%</span>
                </div>
                <div className="investment-details">
                  <div className="investment-amount">75 adet</div>
                  <div className="investment-value">₺3,825</div>
                  <div className="investment-profit">+₺255</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Investment Modal */}
      {/* The InvestmentModal component is removed as per the edit hint. */}
    </div>
  );
};

export default Dashboard; 