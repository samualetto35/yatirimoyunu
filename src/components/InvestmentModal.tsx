import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/databaseService';
import './InvestmentModal.css';

interface MarketItem {
  id: number;
  baz_cur: string;
  yatirim_grubu: string;
  yatirim_araci_kod: string;
  yatirim_araci: string;
}

interface InvestmentSelection {
  id: number;
  percentage: number;
}

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [marketData, setMarketData] = useState<MarketItem[]>([]);
  const [selections, setSelections] = useState<InvestmentSelection[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMarketData();
    }
  }, [isOpen]);

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
        onClose();
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('❌ [INVESTMENT] Error in handleSubmit:', err);
      setError(`Yatırım seçimi kaydedilemedi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="investment-modal-overlay" onClick={onClose}>
      <div className="investment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Yatırım Seçimi</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="percentage-info">
            <span>Toplam: {totalPercentage}%</span>
            {totalPercentage > 100 && <span className="error">%100'ü geçemez!</span>}
            {totalPercentage < 100 && <span className="warning">%100 olmalı</span>}
          </div>

          <div className="market-grid">
            {loading ? (
              <div className="loading">Market verileri yükleniyor...</div>
            ) : marketData.length === 0 ? (
              <div className="loading">Market verisi bulunamadı. Lütfen daha sonra tekrar deneyin.</div>
            ) : (
              marketData.map(item => {
                const selection = selections.find(s => s.id === item.id);
                const percentage = selection?.percentage || 0;

                return (
                  <div key={item.id} className="market-item">
                    <div className="item-header">
                      <div className="item-code">{item.yatirim_araci_kod}</div>
                      <div className="item-name">{item.yatirim_araci}</div>
                    </div>
                    <div className="item-details">
                      <div className="item-group">{item.yatirim_grubu}</div>
                      <div className="item-currency">{item.baz_cur}</div>
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

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
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
    </div>
  );
};

export default InvestmentModal; 