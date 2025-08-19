import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import './Ranking.css';
import { GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon } from './Icons';

interface UserRanking {
  user_email: string;
  value: number;
  rank: number;
  isCurrentUser: boolean;
}

const Ranking: React.FC = () => {
  const { currentUser } = useAuth();
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('latest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [weekOptions, setWeekOptions] = useState([
    { value: 'latest', label: 'En Son Değer' }
  ]);

  useEffect(() => {
    fetchRankings();
  }, [selectedWeek]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError('');

      const allUsersProgress = await DatabaseService.getAllUsersProgress();
      
      if (!allUsersProgress || allUsersProgress.length === 0) {
        setRankings([]);
        return;
      }

      // Veri olan haftaları bul ve week options'ı güncelle
      const availableWeeks = [{ value: 'latest', label: 'En Son Değer' }];
      const weekFields = ['t0stl', 't1stl', 't2stl', 't3stl', 't4stl', 't5stl', 't6stl', 't7stl'];
      const weekLabels = ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta', '5. Hafta', '6. Hafta', '7. Hafta', '8. Hafta'];
      
      weekFields.forEach((field, index) => {
        const hasData = allUsersProgress.some((user: any) => user[field] !== null && user[field] !== undefined);
        if (hasData) {
          availableWeeks.push({ value: field, label: weekLabels[index] });
        }
      });
      
      setWeekOptions(availableWeeks);

      // Seçilen haftaya göre değerleri al ve sırala
      const userValues = allUsersProgress.map((user: any) => {
        let value: number;
        
        if (selectedWeek === 'latest') {
          // En son dolu değeri bul
          const values = [
            user.t7stl,
            user.t6stl,
            user.t5stl,
            user.t4stl,
            user.t3stl,
            user.t2stl,
            user.t1stl,
            user.t0stl,
            user.t0btl
          ];
          value = values.find((v: any) => v !== null && v !== undefined) || user.t0btl;
        } else {
          // Belirli hafta değeri
          value = (user as any)[selectedWeek] || user.t0btl;
        }

        return {
          user_email: user.user_email,
          value: value,
          rank: 0, // Sıralama sonrası set edilecek
          isCurrentUser: currentUser?.email === user.user_email
        };
      });

      // Null olmayan değerleri filtrele ve sırala (yüksekten düşüğe)
      const validUsers = userValues
        .filter((user: any) => user.value !== null && user.value !== undefined)
        .sort((a: any, b: any) => b.value - a.value);

      // Sıralama numaralarını ata
      const rankedUsers = validUsers.map((user: any, index: number) => ({
        ...user,
        rank: index + 1
      }));

      setRankings(rankedUsers);
    } catch (err) {
      console.error('❌ [RANKING] Error fetching rankings:', err);
      setError('Sıralama verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return `₺${value.toLocaleString('tr-TR')}`;
  };

  const getPercentageChange = (value: number): string => {
    const change = ((value - 100000) / 100000) * 100;
    const sign = change > 0 ? '+' : change < 0 ? '' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeClass = (value: number): string => {
    const change = value - 100000;
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="ranking-page">
      <div className="ranking-content">
        <div className="ranking-header">
          <h1>Sıralama</h1>
          <p>Kullanıcıların performans sıralaması</p>
        </div>

        <div className="week-selector">
          <label htmlFor="week-select">Hafta Seçin:</label>
          <select 
            id="week-select"
            value={selectedWeek} 
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="week-select"
          >
            {weekOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Sıralama verileri yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="no-data-state">
            <p>Bu hafta için henüz veri bulunmuyor.</p>
          </div>
        ) : (
          <div className="ranking-list">
            {rankings.map((user, index) => (
              <div 
                key={user.user_email} 
                className={`ranking-card ${user.isCurrentUser ? 'current-user' : ''} ${index < 3 ? 'top-three' : ''}`}
              >
                <div className="rank-position">
                  #{user.rank}
                </div>

                <div className="card-left">
                  <div className={`rank-display ${user.rank <= 3 ? `rank-${user.rank}` : ''}`}>
                    {user.rank <= 3 ? (
                      <span className="rank-medal">
                        {user.rank === 1 ? <GoldMedalIcon size={28} /> : 
                         user.rank === 2 ? <SilverMedalIcon size={28} /> : 
                         <BronzeMedalIcon size={28} />}
                      </span>
                    ) : (
                      <span className="rank-number">{user.rank}</span>
                    )}
                  </div>
                </div>

                <div className="card-center">
                  <div className="user-details">
                    <span className="user-email">{user.user_email}</span>
                    {user.isCurrentUser && <span className="you-badge">Sen</span>}
                  </div>
                  <div className="portfolio-info">
                    <span className="portfolio-value">{formatCurrency(user.value)}</span>
                    <span className={`change-percentage ${getChangeClass(user.value)}`}>
                      {getPercentageChange(user.value)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking; 