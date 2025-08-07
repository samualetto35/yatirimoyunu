-- Gerçek hesaplama trigger'ı
CREATE OR REPLACE FUNCTION calculate_portfolio_real()
RETURNS TRIGGER AS $$
DECLARE
    base_value DECIMAL(10,2);
    percent_string TEXT;
    total_multiplier DECIMAL(10,6);
    final_value DECIMAL(10,2);
    percent_parts TEXT[];
    part TEXT;
    investment_id INTEGER;
    investment_percentage DECIMAL(10,4);
    market_percentage DECIMAL(10,4);
    active_week INTEGER;
BEGIN
    -- Base value'yu al (t0btl)
    SELECT t0btl INTO base_value 
    FROM user_progress 
    WHERE user_id = NEW.user_id;
    
    IF base_value IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Aktif haftayı al
    SELECT 
        CASE 
            WHEN week_1 = 1 THEN 1
            WHEN week_2 = 1 THEN 2
            WHEN week_3 = 1 THEN 3
            WHEN week_4 = 1 THEN 4
            WHEN week_5 = 1 THEN 5
            WHEN week_6 = 1 THEN 6
            WHEN week_7 = 1 THEN 7
            WHEN week_8 = 1 THEN 8
        END INTO active_week
    FROM admin_week_control 
    WHERE group_number = 1;
    
    IF active_week IS NULL THEN
        active_week := 1; -- Varsayılan olarak 1. hafta
    END IF;
    
    -- İlgili percent string'ini al
    percent_string := CASE 
        WHEN active_week = 1 THEN NEW.t0percent
        WHEN active_week = 2 THEN NEW.t1percent
        WHEN active_week = 3 THEN NEW.t2percent
        WHEN active_week = 4 THEN NEW.t3percent
        WHEN active_week = 5 THEN NEW.t4percent
        WHEN active_week = 6 THEN NEW.t5percent
        WHEN active_week = 7 THEN NEW.t6percent
        WHEN active_week = 8 THEN NEW.t7percent
    END;
    
    IF percent_string IS NULL OR percent_string = '' THEN
        RETURN NEW;
    END IF;
    
    -- Percent string'ini parçala
    percent_parts := string_to_array(percent_string, ' ');
    total_multiplier := 0;
    
    -- Her yatırım için hesaplama yap
    FOREACH part IN ARRAY percent_parts
    LOOP
        -- ID ve yüzdeyi ayır
        investment_id := CAST(split_part(part, ';', 1) AS INTEGER);
        investment_percentage := CAST(split_part(part, ';', 2) AS DECIMAL(10,4));
        
        -- Market'ten yüzde değişimi al
        SELECT 
            CASE 
                WHEN active_week = 1 THEN yuzde_t1
                WHEN active_week = 2 THEN yuzde_t2
                WHEN active_week = 3 THEN yuzde_t3
                WHEN active_week = 4 THEN yuzde_t4
                WHEN active_week = 5 THEN yuzde_t5
                WHEN active_week = 6 THEN yuzde_t6
                WHEN active_week = 7 THEN yuzde_t7
                WHEN active_week = 8 THEN yuzde_t8
            END INTO market_percentage
        FROM market 
        WHERE id = investment_id;
        
        -- Eğer market verisi varsa hesaplamaya ekle
        IF market_percentage IS NOT NULL THEN
            total_multiplier := total_multiplier + (investment_percentage * (1 + market_percentage/100));
        ELSE
            -- Market verisi yoksa sadece yüzdeyi ekle
            total_multiplier := total_multiplier + investment_percentage;
        END IF;
    END LOOP;
    
    -- Final değeri hesapla
    final_value := CAST(base_value AS DECIMAL(10,2)) * CAST(total_multiplier AS DECIMAL(10,6));
    
    -- User progress'i güncelle
    UPDATE user_progress 
    SET t0stl = final_value 
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eski trigger'ı sil
DROP TRIGGER IF EXISTS trigger_calculate_new ON user_entries;

-- Yeni trigger oluştur
CREATE TRIGGER trigger_calculate_real
    AFTER UPDATE ON user_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_portfolio_real(); 