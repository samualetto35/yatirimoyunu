-- Her sütunun bağımsız çalıştığı trigger
CREATE OR REPLACE FUNCTION calculate_portfolio_independent()
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
    week_number INTEGER;
    target_column TEXT;
    update_sql TEXT;
BEGIN
    -- Hangi sütun değişti?
    IF TG_OP = 'UPDATE' THEN
        IF OLD.t0percent IS DISTINCT FROM NEW.t0percent THEN
            week_number := 1;
            percent_string := NEW.t0percent;
        ELSIF OLD.t1percent IS DISTINCT FROM NEW.t1percent THEN
            week_number := 2;
            percent_string := NEW.t1percent;
        ELSIF OLD.t2percent IS DISTINCT FROM NEW.t2percent THEN
            week_number := 3;
            percent_string := NEW.t2percent;
        ELSIF OLD.t3percent IS DISTINCT FROM NEW.t3percent THEN
            week_number := 4;
            percent_string := NEW.t3percent;
        ELSIF OLD.t4percent IS DISTINCT FROM NEW.t4percent THEN
            week_number := 5;
            percent_string := NEW.t4percent;
        ELSIF OLD.t5percent IS DISTINCT FROM NEW.t5percent THEN
            week_number := 6;
            percent_string := NEW.t5percent;
        ELSIF OLD.t6percent IS DISTINCT FROM NEW.t6percent THEN
            week_number := 7;
            percent_string := NEW.t6percent;
        ELSIF OLD.t7percent IS DISTINCT FROM NEW.t7percent THEN
            week_number := 8;
            percent_string := NEW.t7percent;
        ELSE
            RETURN NEW; -- Değişiklik yok
        END IF;
    ELSE
        -- INSERT durumunda t0percent varsa 1. hafta
        IF NEW.t0percent IS NOT NULL AND NEW.t0percent != '' THEN
            week_number := 1;
            percent_string := NEW.t0percent;
        ELSIF NEW.t1percent IS NOT NULL AND NEW.t1percent != '' THEN
            week_number := 2;
            percent_string := NEW.t1percent;
        ELSIF NEW.t2percent IS NOT NULL AND NEW.t2percent != '' THEN
            week_number := 3;
            percent_string := NEW.t2percent;
        ELSIF NEW.t3percent IS NOT NULL AND NEW.t3percent != '' THEN
            week_number := 4;
            percent_string := NEW.t3percent;
        ELSIF NEW.t4percent IS NOT NULL AND NEW.t4percent != '' THEN
            week_number := 5;
            percent_string := NEW.t4percent;
        ELSIF NEW.t5percent IS NOT NULL AND NEW.t5percent != '' THEN
            week_number := 6;
            percent_string := NEW.t5percent;
        ELSIF NEW.t6percent IS NOT NULL AND NEW.t6percent != '' THEN
            week_number := 7;
            percent_string := NEW.t6percent;
        ELSIF NEW.t7percent IS NOT NULL AND NEW.t7percent != '' THEN
            week_number := 8;
            percent_string := NEW.t7percent;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Base value'yu belirle
    IF week_number = 1 THEN
        SELECT t0btl INTO base_value FROM user_progress WHERE user_id = NEW.user_id;
    ELSE
        -- Önceki haftanın stl değerini al
        EXECUTE format('SELECT t%sstl FROM user_progress WHERE user_id = %L', week_number-2, NEW.user_id) INTO base_value;
        IF base_value IS NULL THEN
            SELECT t0btl INTO base_value FROM user_progress WHERE user_id = NEW.user_id;
        END IF;
    END IF;

    IF base_value IS NULL OR percent_string IS NULL OR percent_string = '' THEN
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
                WHEN week_number = 1 THEN yuzde_t1
                WHEN week_number = 2 THEN yuzde_t2
                WHEN week_number = 3 THEN yuzde_t3
                WHEN week_number = 4 THEN yuzde_t4
                WHEN week_number = 5 THEN yuzde_t5
                WHEN week_number = 6 THEN yuzde_t6
                WHEN week_number = 7 THEN yuzde_t7
                WHEN week_number = 8 THEN yuzde_t8
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
    
    -- Hangi sütun güncellenecek?
    target_column := format('t%sstl', week_number-1);
    
    -- User progress'i güncelle
    EXECUTE format('UPDATE user_progress SET %I = %s WHERE user_id = %L', 
                   target_column, 
                   final_value,
                   NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eski trigger'ı sil
DROP TRIGGER IF EXISTS trigger_calculate_real ON user_entries;

-- Yeni trigger oluştur
CREATE TRIGGER trigger_calculate_independent
    AFTER UPDATE ON user_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_portfolio_independent(); 