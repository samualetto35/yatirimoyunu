import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import './Investments.css';

interface InvestmentPosition {
  id: number;
  percentage: number;
  ticker: string;
  name: string;
  currency: string;
  weekReturn?: number; // Haftalık getiri yüzdesi
}

interface WeeklyInvestment {
  week: number;
  positions: InvestmentPosition[];
  totalReturn: number; // Haftalık toplam getiri
  startValue: number;
  endValue: number;
}

const Investments: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentWeekInvestments, setCurrentWeekInvestments] = useState<InvestmentPosition[]>([]);
  const [previousWeeksInvestments, setPreviousWeeksInvestments] = useState<WeeklyInvestment[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [progressState, setProgressState] = useState<any>(null);
  const [userEntries, setUserEntries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Tüm gerekli verileri çek
        const [progress, entries, market] = await Promise.all([
          DatabaseService.getUserProgress(currentUser.uid),
          DatabaseService.getUserEntries(currentUser.uid),
          DatabaseService.getMarketData()
        ]);

        setProgressState(progress);
        setUserEntries(entries);
        setMarketData(market || []);

        if (progress && entries && market) {
          // Güncel hafta yatırımlarını hesapla
          const currentPositions = getCurrentWeekPositions(entries, market);
          setCurrentWeekInvestments(currentPositions);

          // Geçmiş hafta yatırımlarını hesapla
          const previousWeeks = getPreviousWeeksData(progress, entries, market);
          setPreviousWeeksInvestments(previousWeeks);
        }
      } catch (error) {
        console.error('❌ [INVESTMENTS] Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Güncel haftanın pozisyonlarını getir
  const getCurrentWeekPositions = (entries: any, market: any[]): InvestmentPosition[] => {
    if (!entries || !market) return [];

    // En son girilmiş percent string'ini bul (ters sırayla - en yeniden eskiye)
    const percentFields = [
      entries.t7percent,
      entries.t6percent,
      entries.t5percent,
      entries.t4percent,
      entries.t3percent,
      entries.t2percent,
      entries.t1percent,
      entries.t0percent
    ];

    const lastPercentString = percentFields.find(field => field && field.trim() !== '');
    if (!lastPercentString) return [];

    // Hangi hafta field'ı kullanıldığını bul
    const currentWeekIndex = percentFields.findIndex(field => field === lastPercentString);
    const weekNumber = 7 - currentWeekIndex; // t7percent = hafta 1, t6percent = hafta 2, etc.

    // "4;0.3 12;0.7" formatındaki string'i parçala
    const positions = lastPercentString.split(' ').filter((pos: string) => pos.trim() !== '');

    return positions.map((pos: string) => {
      const [id, percentage] = pos.split(';');
      const marketItem = market.find(item => item.id === parseInt(id));
      
      // Market tablosundan ilgili hafta getiri verisi
      let weekReturn: number | undefined;
      if (marketItem && weekNumber >= 1 && weekNumber <= 8) {
        const returnField = `yuzde_t${weekNumber}`;
        weekReturn = marketItem[returnField];
      }
      
      return {
        id: parseInt(id),
        percentage: parseFloat(percentage) * 100,
        ticker: marketItem?.yatirim_araci_kod || 'N/A',
        name: marketItem?.yatirim_araci || 'N/A',
        currency: marketItem?.baz_cur || 'N/A',
        weekReturn: weekReturn
      };
    });
  };

  // Geçmiş haftalardaki yatırımları ve getirilerini hesapla
  const getPreviousWeeksData = (progress: any, entries: any, market: any[]): WeeklyInvestment[] => {
    if (!progress || !entries || !market) return [];

    const progressValues = [
      progress.t0btl,  // 0. hafta başı
      progress.t0stl,  // 0. hafta sonu
      progress.t1stl,  // 1. hafta sonu
      progress.t2stl,  // 2. hafta sonu
      progress.t3stl,  // 3. hafta sonu
      progress.t4stl,  // 4. hafta sonu
      progress.t5stl,  // 5. hafta sonu
      progress.t6stl,  // 6. hafta sonu
      progress.t7stl   // 7. hafta sonu
    ];

    const percentFields = [
      entries.t0percent,
      entries.t1percent,
      entries.t2percent,
      entries.t3percent,
      entries.t4percent,
      entries.t5percent,
      entries.t6percent,
      entries.t7percent
    ];

    // Güncel hafta verisini bul (en son dolu olan - ters sırayla)
    const currentWeekPercentString = [
      entries.t7percent,
      entries.t6percent,
      entries.t5percent,
      entries.t4percent,
      entries.t3percent,
      entries.t2percent,
      entries.t1percent,
      entries.t0percent
    ].find(field => field && field.trim() !== '');

    const weeks: WeeklyInvestment[] = [];

    for (let weekIndex = 0; weekIndex < 8; weekIndex++) {
      const percentString = percentFields[weekIndex];
      const startValue = weekIndex === 0 ? progress.t0btl : progressValues[weekIndex];
      const endValue = progressValues[weekIndex + 1];

      // Güncel hafta ile aynı olan veriyi atla
      if (percentString === currentWeekPercentString) {
        continue;
      }

      // Eğer bu hafta için yatırım verisi varsa
      if (percentString && percentString.trim() !== '' && startValue != null && endValue != null) {
        const positions = percentString.split(' ')
          .filter((pos: string) => pos.trim() !== '')
          .map((pos: string) => {
            const [id, percentage] = pos.split(';');
            const marketItem = market.find(item => item.id === parseInt(id));
            
            // Her parite için market tablosundan gerçek haftalık getiri
            const investmentPercentage = parseFloat(percentage) * 100;
            let actualWeekReturn: number | undefined;
            
            if (marketItem && weekIndex >= 0 && weekIndex <= 7) {
              const returnField = `yuzde_t${weekIndex + 1}`;
              actualWeekReturn = marketItem[returnField];
            }

            return {
              id: parseInt(id),
              percentage: investmentPercentage,
              ticker: marketItem?.yatirim_araci_kod || 'N/A',
              name: marketItem?.yatirim_araci || 'N/A',
              currency: marketItem?.baz_cur || 'N/A',
              weekReturn: actualWeekReturn
            };
          });

        const totalReturn = ((endValue - startValue) / startValue) * 100;

        weeks.push({
          week: weekIndex + 1,
          positions,
          totalReturn,
          startValue,
          endValue
        });
      }
    }

    return weeks.reverse(); // En yeni haftayı en üstte göster
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="investments-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Yatırım verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investments-page">
      <div className="investments-content">
        <div className="investments-header">
          <h1>Yatırımlarım</h1>
          <p>Güncel ve geçmiş haftalardaki yatırım pozisyonlarınız</p>
        </div>

        {/* Güncel Hafta */}
        <div className="current-week-section">
          <div className="section-header">
            <h2>Güncel Hafta</h2>
            <span className="current-badge">Aktif</span>
          </div>
          
          {currentWeekInvestments.length > 0 ? (
            <div className="investments-grid">
              {currentWeekInvestments.map((position, index) => (
                <div key={index} className="investment-card current">
                  <div className="card-header">
                    <div className="ticker-name">
                      <span className="ticker">{position.ticker}</span>
                      <span className="currency">{position.currency}</span>
                    </div>
                    <div className="position-returns">
                      <span className="percentage">{position.percentage.toFixed(1)}%</span>
                      {position.weekReturn !== undefined && (
                        <span className={`position-return ${position.weekReturn >= 0 ? 'positive' : 'negative'}`}>
                          {position.weekReturn >= 0 ? '+' : ''}{position.weekReturn.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-content">
                    <p className="investment-name">{position.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-investments">
              <p>Henüz bu hafta için yatırım yapılmamış</p>
            </div>
          )}
        </div>

        {/* Geçmiş Haftalar */}
        <div className="previous-weeks-section">
          <div className="section-header">
            <h2>Geçmiş Haftalar</h2>
          </div>

          {previousWeeksInvestments.length > 0 ? (
            <div className="weeks-container">
              {previousWeeksInvestments.map((weekData) => (
                <div key={weekData.week} className="week-card">
                  <div className="week-header">
                    <div className="week-info">
                      <h3>{weekData.week}. Hafta</h3>
                      <span className={`week-return ${weekData.totalReturn >= 0 ? 'positive' : 'negative'}`}>
                        {weekData.totalReturn >= 0 ? '+' : ''}{weekData.totalReturn.toFixed(2)}%
                      </span>
                    </div>
                    <div className="week-values">
                      <span className="value-info">
                        ₺{weekData.startValue.toLocaleString('tr-TR')} → ₺{weekData.endValue.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  <div className="week-investments">
                    {weekData.positions.map((position, index) => (
                      <div key={index} className="investment-card previous">
                        <div className="card-header">
                          <div className="ticker-name">
                            <span className="ticker">{position.ticker}</span>
                            <span className="currency">{position.currency}</span>
                          </div>
                          <div className="position-returns">
                            <span className="percentage">{position.percentage.toFixed(1)}%</span>
                            {position.weekReturn !== undefined && (
                              <span className={`position-return ${position.weekReturn >= 0 ? 'positive' : 'negative'}`}>
                                {position.weekReturn >= 0 ? '+' : ''}{position.weekReturn.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="card-content">
                          <p className="investment-name">{position.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-investments">
              <p>Henüz geçmiş hafta yatırımı bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investments; 