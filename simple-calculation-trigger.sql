-- Basit hesaplama trigger'ı
CREATE OR REPLACE FUNCTION calculate_portfolio_simple()
RETURNS TRIGGER AS $$
DECLARE
    base_value DECIMAL(10,2);
    percent_string TEXT;
    total_multiplier DECIMAL(10,6);
    final_value DECIMAL(10,2);
BEGIN
    -- Base value'yu al (t0btl)
    SELECT t0btl INTO base_value 
    FROM user_progress 
    WHERE user_id = NEW.user_id;
    
    IF base_value IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Percent string'ini al
    percent_string := NEW.t0percent;
    
    IF percent_string IS NULL OR percent_string = '' THEN
        RETURN NEW;
    END IF;
    
    -- Basit hesaplama: toplam yüzdeyi al
    total_multiplier := 1.0; -- Başlangıç değeri
    
    -- User progress'i güncelle
    UPDATE user_progress 
    SET t0stl = base_value * total_multiplier 
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eski trigger'ları sil
DROP TRIGGER IF EXISTS trigger_calculate_all_portfolio ON user_entries;
DROP TRIGGER IF EXISTS trigger_calculate_all_portfolio_market ON market;

-- Yeni basit trigger'ı oluştur
CREATE TRIGGER trigger_calculate_simple
    AFTER UPDATE ON user_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_portfolio_simple(); 