import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { LockIcon, PlusIcon } from './Icons';

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
  const [userEntries, setUserEntries] = useState<any>(null);
  const [isSavingInvestment, setIsSavingInvestment] = useState(false);
  const [saveModal, setSaveModal] = useState<null | { type: 'success' | 'error'; message: string }>(null);

  // Geçen hafta özet bilgisi (temsil edilen haftanın bir öncesi)
  // Bu hook yukarıda tek kez tanımlandı; hesaplama aşağıdaki başka useEffect içinde yapılacak

  // Tooltip state for Average Weekly Return chart
  const [avgActivePoint, setAvgActivePoint] = useState<{
    idx: number;
    val: number;
    left: string;
    bottom: string;
  } | null>(null);

  const [lastWeekSummary, setLastWeekSummary] = useState<{
    previousWeek: number | null;
    top: Array<{ code: string; name: string; percent: number }>;
    worst: { code: string; name: string; percent: number } | null;
    message?: string;
  }>({ previousWeek: null, top: [], worst: null });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!currentUser) return;
      const progress = await DatabaseService.getUserProgress(currentUser.uid);
      const entries = await DatabaseService.getUserEntries(currentUser.uid);
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
      if (entries) {
        setUserEntries(entries);
      }
    };
    
    const fetchData = async () => {
      await fetchProgress();
      await fetchMarketData(); // Market verilerini de yükle
      try {
        const week = await DatabaseService.getActiveWeek();
        setActiveWeek(week ?? 0);
      } catch (e) {
        console.error('❌ [DASHBOARD] Error fetching active week (interval):', e);
        setActiveWeek(0);
      }
    };
    
    fetchData();
    
    // 1 saatte bir otomatik refresh
    const interval = setInterval(fetchData, 3600000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const loadLastWeekMovers = async () => {
      try {
        const representedWeek = await DatabaseService.getRepresentedWeek();
        if (!representedWeek || representedWeek <= 1) {
          setLastWeekSummary({ previousWeek: null, top: [], worst: null, message: 'Geçmiş veri yok' });
          return;
        }
        const prevWeek = representedWeek - 1;
        if (!marketData || marketData.length === 0) {
          const md = await DatabaseService.getMarketData();
          computeAndSet(md, prevWeek);
        } else {
          computeAndSet(marketData, prevWeek);
        }
      } catch (e) {
        console.error('❌ [DASHBOARD] last week movers error:', e);
        setLastWeekSummary({ previousWeek: null, top: [], worst: null, message: 'Veri alınamadı' });
      }
    };

    const computeAndSet = (md: Array<any>, prevWeek: number) => {
      const percentKey = `yuzde_t${prevWeek}` as keyof typeof md[number];
      const rows = md
        .map(r => ({
          code: r.yatirim_araci_kod,
          name: r.yatirim_araci,
          percent: typeof r[percentKey] === 'number' ? (r[percentKey] as number) : 0
        }))
        .filter(r => r.percent !== null && r.percent !== undefined);
      if (rows.length === 0) {
        setLastWeekSummary({ previousWeek: prevWeek, top: [], worst: null, message: 'Veri yok' });
        return;
      }
      const sorted = [...rows].sort((a, b) => b.percent - a.percent);
      const top = sorted.slice(0, 3);
      const worst = sorted[sorted.length - 1];
      setLastWeekSummary({ previousWeek: prevWeek, top, worst });
    };

    loadLastWeekMovers();
  }, [marketData]);

  // Aktif pozisyonları hesapla
  const getActivePositions = () => {
    if (!userEntries || !marketData) {
      console.log('🔍 [DEBUG] userEntries or marketData is null:', { userEntries, marketData });
      return [];
    }
    
    console.log('🔍 [DEBUG] userEntries:', userEntries);
    console.log('🔍 [DEBUG] marketData length:', marketData.length);
    
    // En son girilmiş percent string'ini bul
    const percentFields = [
      userEntries.t7percent,
      userEntries.t6percent,
      userEntries.t5percent,
      userEntries.t4percent,
      userEntries.t3percent,
      userEntries.t2percent,
      userEntries.t1percent,
      userEntries.t0percent
    ];
    
    const lastPercentString = percentFields.find(field => field && field.trim() !== '');
    console.log('🔍 [DEBUG] lastPercentString:', lastPercentString);
    
    if (!lastPercentString) {
      console.log('🔍 [DEBUG] No lastPercentString found');
      return [];
    }
    
    // "4;0.3 12;0.7" formatındaki string'i parçala
    const positions = lastPercentString.split(' ').filter((pos: string) => pos.trim() !== '');
    console.log('🔍 [DEBUG] positions:', positions);
    
    // Her pozisyon için market verilerini bul
    const result = positions.map((pos: string) => {
      const [id, percentage] = pos.split(';');
      console.log('🔍 [DEBUG] Processing position:', { id, percentage });
      
      const marketItem = marketData.find(item => item.id === parseInt(id));
      console.log('🔍 [DEBUG] Found marketItem:', marketItem);
      
      const resultItem = {
        id: parseInt(id),
        percentage: parseFloat(percentage) * 100, // 0.3 -> 30
        ticker: marketItem?.yatirim_araci_kod || 'N/A',
        name: marketItem?.yatirim_araci || 'N/A',
        currency: marketItem?.baz_cur || 'N/A'
      };
      
      console.log('🔍 [DEBUG] Result item:', resultItem);
      return resultItem;
    });
    
    console.log('🔍 [DEBUG] Final result:', result);
    return result;
  };

  // Önceki hafta değerini hesapla
  const getPreviousWeekValue = () => {
    if (!progressState) return null;
    
    // En son dolu stl değerini bul
    const stlFields = [
      progressState.t7stl,
      progressState.t6stl,
      progressState.t5stl,
      progressState.t4stl,
      progressState.t3stl,
      progressState.t2stl,
      progressState.t1stl,
      progressState.t0stl
    ];
    
    const lastStlValue = stlFields.find(field => field !== null && field !== undefined);
    return lastStlValue;
  };

  // Önceki hafta pozisyon sayısını hesapla
  const getPreviousWeekPositionsCount = () => {
    if (!userEntries) return 0;
    
    // En son girilmiş percent string'ini bul
    const percentFields = [
      userEntries.t7percent,
      userEntries.t6percent,
      userEntries.t5percent,
      userEntries.t4percent,
      userEntries.t3percent,
      userEntries.t2percent,
      userEntries.t1percent,
      userEntries.t0percent
    ];
    
    console.log('🔍 [DEBUG] All percent fields:', percentFields);
    
    // En son dolu alanın index'ini bul
    const lastFilledIndex = percentFields.findIndex(field => field && field.trim() !== '');
    console.log('🔍 [DEBUG] Last filled index:', lastFilledIndex);
    
    if (lastFilledIndex === -1) {
      console.log('🔍 [DEBUG] No filled field found, returning 0');
      return 0; // Hiç dolu alan yok
    }
    
    // Bir önceki dolu alanı bul
    const previousFilledIndex = percentFields.findIndex((field, index) => 
      index > lastFilledIndex && field && field.trim() !== ''
    );
    
    console.log('🔍 [DEBUG] Previous filled index:', previousFilledIndex);
    
    if (previousFilledIndex === -1) {
      console.log('🔍 [DEBUG] No previous filled field found, returning 0');
      return 0; // Bir önceki dolu alan yok
    }
    
    const previousPercentString = percentFields[previousFilledIndex];
    console.log('🔍 [DEBUG] Previous percent string:', previousPercentString);
    
    // "4;0.3 12;0.7" formatındaki string'i parçala
    const positions = previousPercentString.split(' ').filter((pos: string) => pos.trim() !== '');
    console.log('🔍 [DEBUG] Parsed positions:', positions);
    console.log('🔍 [DEBUG] Position count:', positions.length);
    
    return positions.length;
  };

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
      setActiveWeek(week ?? 0);
    } catch (err) {
      console.error('❌ [DASHBOARD] Error fetching active week:', err);
      setActiveWeek(0);
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
      setIsSavingInvestment(true);
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
      setSaveModal({ type: 'success', message: 'Yatırım seçiminiz başarıyla kaydedildi!' });
      setTimeout(() => {
        setShowInvestmentPanel(false);
        setSaveModal(null);
      }, 1800);

    } catch (err) {
      console.error('❌ [INVESTMENT] Error in handleSubmit:', err);
      const msg = `Yatırım seçimi kaydedilemedi: ${err instanceof Error ? err.message : String(err)}`;
      setError(msg);
      setSaveModal({ type: 'error', message: msg });
    } finally {
      setIsSavingInvestment(false);
    }
  };

  // Ortalama haftalık getiri (TL) hesaplama
  const getAverageWeeklyReturn = (): number | null => {
    if (!progressState) return null;
    const seriesRaw = [
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
    const series = seriesRaw.filter((v) => v !== null && v !== undefined) as number[];
    if (series.length < 2) return null;
    const diffs = [] as number[];
    for (let i = 1; i < series.length; i += 1) {
      const delta = series[i] - series[i - 1];
      if (delta !== 0) {
        diffs.push(delta);
      }
    }
    if (diffs.length === 0) return 0;
    const sum = diffs.reduce((acc, v) => acc + v, 0);
    return sum / diffs.length;
  };

  // Son haftalık fark (TL) hesaplama (en son iki dolu değer farkı)
  const getLastWeekDelta = (): number | null => {
    if (!progressState) return null;
    const seriesRaw = [
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
    const series = seriesRaw.filter((v) => v !== null && v !== undefined) as number[];
    if (series.length < 2) return null;
    const last = series[series.length - 1];
    const prev = series[series.length - 2];
    return last - prev;
  };

  // Haftalık farklar (0 olmayanlar) hesaplama
  const getWeeklyDiffs = (): number[] => {
    if (!progressState) return [];
    const seriesRaw = [
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
    const series = seriesRaw.filter((v) => v !== null && v !== undefined) as number[];
    if (series.length < 2) return [];
    const diffs: number[] = [];
    for (let i = 1; i < series.length; i += 1) {
      const delta = series[i] - series[i - 1];
      if (delta !== 0) diffs.push(delta);
    }
    return diffs;
  };

  // Geçen haftanın (temsil edilen haftanın bir önceki) en çok kazanan ve kaybettirenlerini getir
  const getLastWeekTopMovers = () => {
    if (!marketData) return null;
    // admin_week_control tablosundan temsil edilen hafta (1 veya 2 olan) -> representedWeek
    // Ardından previousWeek = representedWeek - 1
    // previousWeek < 1 ise geçmiş veri yok
    return null; // placeholder, render'da async veri çekilecek
  };

  const formatSignedCurrency = (value: number): string => {
    const rounded = Math.round(value);
    const sign = rounded > 0 ? '+' : '';
    return `${sign}₺${rounded.toLocaleString('tr-TR')}`;
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

  const isInvestmentEnabled = activeWeek > 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>
            Yatırım portföyünüzün genel durumu
            {currentUser?.email && (
              <span style={{ marginLeft: '8px', color: '#ffffff' }}>— {currentUser.email}</span>
            )}
          </p>
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
                  {portfolioValue !== null && previousPortfolioValue !== null ? `${(portfolioValue - previousPortfolioValue) > 0 ? '' : ''}₺${(portfolioValue - previousPortfolioValue).toLocaleString('tr-TR')}` : '...'}
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
                  {portfolioValue !== null ? `${(portfolioValue - 100000) > 0 ? '' : ''}₺${(portfolioValue - 100000).toLocaleString('tr-TR')}` : '...'}
                </span>
                <span>Tüm zamanlar</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card" onClick={() => scrollToSection('aktif-yatirimlar')}>
            <div className="card-header">
              <h3>Aktif Pozisyonlar</h3>
              <span className="card-badge neutral">Aktif</span>
            </div>
            <div className="card-value">{getActivePositions().length}</div>
            <div className="card-details">
              <span>{getPreviousWeekPositionsCount()}</span>
              <span>Önceki Hafta</span>
            </div>
          </div>

          <div className="dashboard-card" onClick={() => scrollToSection('ortalama-getiri')}>
            <div className="card-header">
              <h3>Ortalama Haftalık Getiri</h3>
            </div>
            <div className="card-value">
              {(() => {
                const avg = getAverageWeeklyReturn();
                return avg !== null
                  ? `₺${Math.round(avg).toLocaleString('tr-TR')}`
                  : '...';
              })()}
            </div>
            <div className="card-details">
              {(() => {
                const delta = getLastWeekDelta();
                const cls = delta !== null ? (delta > 0 ? 'value-positive' : delta < 0 ? 'value-negative' : '') : '';
                return (
                  <>
                    <span className={cls}>{delta !== null ? formatSignedCurrency(delta) : '...'}</span>
                    <span>Önceki Hafta</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Geçen Hafta Öne Çıkanlar</h3>
            </div>
            <div className="card-value">
              {lastWeekSummary.previousWeek ? `${lastWeekSummary.previousWeek}. Hafta` : (lastWeekSummary.message || '...')}
            </div>
            <div className="card-details" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lastWeekSummary.message ? (
                <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{lastWeekSummary.message}</span>
              ) : (
                <>
                  {lastWeekSummary.top.map((it, idx) => (
                    <div key={it.code + idx} className="value-positive" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#495057' }}>{idx + 1}. {it.code}</span>
                      <span>{it.percent > 0 ? '+' : ''}{it.percent.toFixed(2)}%</span>
                    </div>
                  ))}
                  {lastWeekSummary.worst && (
                    <div className="value-negative" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: '#495057' }}>En Kötü: {lastWeekSummary.worst.code}</span>
                      <span>{lastWeekSummary.worst.percent > 0 ? '+' : ''}{lastWeekSummary.worst.percent.toFixed(2)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Yatırım Ekle Butonu */}
        <div className="investment-add-section">
          <button 
            className={`investment-add-btn ${!isInvestmentEnabled ? 'disabled' : ''}`} 
            disabled={!isInvestmentEnabled}
            onClick={() => {
              console.log('🔍 [DASHBOARD] Investment button clicked');
              console.log('🔍 [DASHBOARD] Current showInvestmentPanel state:', showInvestmentPanel);
              setShowInvestmentPanel(!showInvestmentPanel);
              console.log('🔍 [DASHBOARD] Set showInvestmentPanel to:', !showInvestmentPanel);
            }}
          >
            {isInvestmentEnabled ? (
              <>
                <PlusIcon size={18} className="add-icon" />
                <span className="add-text">Yatırım Ekle</span>
              </>
            ) : (
              <span className="add-text disabled-message">
                <LockIcon size={16} />
                Cumartesi günü admin tarafından açılacaktır
              </span>
            )}
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
                              value={percentage === 0 ? '' : percentage}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const normalized = raw === '' ? 0 : Number(raw.replace(/^0+(?=\d)/, ''));
                                handlePercentageChange(item.id, normalized);
                              }}
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

        {(isSavingInvestment || saveModal) && (
          <div className="overlay-backdrop">
            {isSavingInvestment && (
              <div className="overlay-center">
                <div className="spinner-lg" />
                <div className="overlay-text">Kaydediliyor...</div>
              </div>
            )}
            {saveModal && (
              <div className={`overlay-modal ${saveModal.type}`} role="dialog" aria-modal="true">
                <div className="modal-title">{saveModal.type === 'success' ? 'Başarılı' : 'Hata'}</div>
                <div className="modal-body">{saveModal.message}</div>
                <div className="modal-actions">
                  <button onClick={() => setSaveModal(null)} className="btn-ok">Tamam</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="dashboard-sections">
          <div className="section-card clickable" onClick={() => window.open('https://www.tradingview.com/watchlists/194281935/', '_blank', 'noopener,noreferrer')}>
            <h3>Piyasa Özeti</h3>
            <span className="external-link-arrow" aria-hidden>↗</span>
          </div>

          <div className="section-card clickable" onClick={() => navigate('/gecmis-veriler')}>
            <h3>Geçmiş Veriler</h3>
            <span className="external-link-arrow" aria-hidden>↗</span>
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
                  {(() => {
                    // Build series from progressState
                    const raw = progressState ? [
                      progressState.t0btl,
                      progressState.t0stl,
                      progressState.t1stl,
                      progressState.t2stl,
                      progressState.t3stl,
                      progressState.t4stl,
                      progressState.t5stl,
                      progressState.t6stl,
                      progressState.t7stl,
                    ] : [];
                    const series = raw.filter(v => v !== null && v !== undefined) as number[];
                    // Compute percent diffs week-over-week
                    const diffs = series.length >= 2
                      ? series.slice(1).map((v, i) => ((v - series[i]) / series[i]) * 100)
                      : [] as number[];
                    // Determine y-axis range
                    const minVal = Math.min(0, ...diffs);
                    const maxVal = Math.max(0, ...diffs);
                    const range = Math.max(5, maxVal - minVal);
                    const pad = Math.max(2.5, range * 0.1);
                    const yMin = Math.floor((minVal - pad) * 10) / 10;
                    const yMax = Math.ceil((maxVal + pad) * 10) / 10;
                    const steps = 5;
                    const step = (yMax - yMin) / steps;
                    const yLabels = Array.from({ length: steps + 1 }, (_, i) => yMax - i * step);
                    // Map to coordinates
                    const pointCoords = diffs.map((val, idx) => {
                      const weekIdx = idx + 1; // 1..8
                      const x = (weekIdx / 8) * 100;
                      const y = 100 - ((val - yMin) / (yMax - yMin)) * 100;
                      return { x, y, val, idx: weekIdx - 1 };
                    });
                    return (
                      <>
                        <div className="y-axis">
                          {yLabels.map((val, i) => (
                            <span key={i}>{`${val > 0 ? '+' : ''}${val.toFixed(1)}%`}</span>
                          ))}
                        </div>
                        <div className="chart-area">
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
                          {/* Zero percent baseline (dotted) */}
                          {(() => {
                            const yZero = 100 - ((0 - yMin) / (yMax - yMin)) * 100;
                            return (
                              <svg className="chart-svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <line x1={0} y1={yZero} x2={100} y2={yZero} stroke="#9aa0a6" strokeWidth="1" strokeDasharray="2,2" opacity="0.9" />
                              </svg>
                            );
                          })()}
                          {pointCoords.map(({ val, idx, x, y }) => {
                            const left = `${x}%`;
                            const bottom = `${100 - y}%`;
                            return (
                              <div
                                key={`avg-pt-${idx}`}
                                className="chart-point avg-point"
                                style={{ left, bottom }}
                                onMouseEnter={() => setAvgActivePoint({ idx, val, left, bottom })}
                                onMouseLeave={() => setAvgActivePoint(null)}
                                onTouchStart={() => setAvgActivePoint({ idx, val, left, bottom })}
                                onTouchEnd={() => setAvgActivePoint(null)}
                                onClick={() => setAvgActivePoint({ idx, val, left, bottom })}
                              ></div>
                            );
                          })}
                          {avgActivePoint && (
                            <div
                              className="chart-tooltip"
                              style={{ left: avgActivePoint.left, bottom: `calc(${avgActivePoint.bottom} + 24px)` }}
                            >
                              <div className="tooltip-week">{avgActivePoint.idx + 1}. Hafta</div>
                              <div className="tooltip-value">{`${avgActivePoint.val > 0 ? '+' : ''}${avgActivePoint.val.toFixed(2)}%`}</div>
                            </div>
                          )}
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
                      </>
                    );
                  })()}
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
                  {(() => {
                    const raw = progressState ? [
                      progressState.t0btl,
                      progressState.t0stl,
                      progressState.t1stl,
                      progressState.t2stl,
                      progressState.t3stl,
                      progressState.t4stl,
                      progressState.t5stl,
                      progressState.t6stl,
                      progressState.t7stl,
                    ] : [];
                    const series = raw.filter(v => v !== null && v !== undefined) as number[];
                    const diffs = series.length >= 2
                      ? series.slice(1).map((v, i) => ((v - series[i]) / series[i]) * 100)
                      : [] as number[];
                    const cells = Array.from({ length: 8 }, (_, i) => {
                      const v = diffs[i];
                      if (v === undefined || Number.isNaN(v)) return (
                        <td key={i}>-</td>
                      );
                      const cls = v > 0 ? 'value-positive' : v < 0 ? 'value-negative' : '';
                      const text = `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
                      return (
                        <td key={i} className={cls}>{text}</td>
                      );
                    });
                    return (
                      <tr>
                        {cells}
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="aktif-yatirimlar" className="detail-section">
          <div className="section-card">
            <h3>Aktif Pozisyonlar Detayı</h3>
            <div className="investments-grid">
              {getActivePositions().map((item: any, index: number) => (
                <div key={index} className="investment-item">
                  <div className="investment-left">
                    <div className="investment-ticker">{item.ticker}</div>
                    <div className="investment-name">{item.name}</div>
                  </div>
                  <div className="investment-center">
                    <div className="investment-dot"></div>
                    <div className="investment-currency">{item.currency}</div>
                  </div>
                  <div className="investment-right">
                    <div className="investment-percentage">{item.percentage}%</div>
                  </div>
                </div>
              ))}
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