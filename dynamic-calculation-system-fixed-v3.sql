-- Dinamik hesaplama sistemi - tüm sütunları günceller (düzeltilmiş v3)
CREATE OR REPLACE FUNCTION calculate_all_portfolio_values()
RETURNS TRIGGER AS $$
DECLARE
    user_progress_record RECORD;
    user_entries_record RECORD;
    week_number INTEGER;
    target_column TEXT;
    base_value DECIMAL(10,2);
    total_multiplier DECIMAL(10,6);
    percent_parts TEXT[];
    part TEXT;
    investment_id INTEGER;
    investment_percentage DECIMAL(10,4);
    market_percentage DECIMAL(10,4);
    percent_string TEXT;
    final_value DECIMAL(10,2);
    last_final_value DECIMAL(10,2);
BEGIN
    -- User progress ve entries kayıtlarını al
    SELECT * INTO user_progress_record 
    FROM user_progress 
    WHERE user_id = NEW.user_id;
    
    SELECT * INTO user_entries_record 
    FROM user_entries 
    WHERE user_id = NEW.user_id;
    
    IF user_progress_record IS NULL OR user_entries_record IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Her hafta için hesaplama yap (t0stl'den t7stl'ye kadar)
    FOR week_number IN 1..8 LOOP
        target_column := 't' || (week_number - 1) || 'stl';
        
        -- Base value'yu belirle (her hafta bir önceki haftanın güncel sonucunu kullan)
        IF week_number = 1 THEN
            base_value := user_progress_record.t0btl;
        ELSE
            base_value := COALESCE(last_final_value, user_progress_record.t0btl);
        END IF;
        
        -- İlgili percent string'ini al
        percent_string := CASE 
            WHEN week_number = 1 THEN user_entries_record.t0percent
            WHEN week_number = 2 THEN user_entries_record.t1percent
            WHEN week_number = 3 THEN user_entries_record.t2percent
            WHEN week_number = 4 THEN user_entries_record.t3percent
            WHEN week_number = 5 THEN user_entries_record.t4percent
            WHEN week_number = 6 THEN user_entries_record.t5percent
            WHEN week_number = 7 THEN user_entries_record.t6percent
            WHEN week_number = 8 THEN user_entries_record.t7percent
        END;
        
        -- Eğer percent string boşsa bu hafta için hesaplama yapma
        IF percent_string IS NULL OR percent_string = '' THEN
            CONTINUE;
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
            -- Market verisi yoksa yok say
            IF market_percentage IS NULL THEN
                CONTINUE;
            END IF;
            -- market_percentage % cinsinden; ağırlıklı çarpan topla
            total_multiplier := total_multiplier + (investment_percentage * (1 + market_percentage/100));
        END LOOP;
        
        -- Final değeri hesapla ve 2 hane yuvarla
        final_value := ROUND(CAST(base_value AS DECIMAL(10,2)) * CAST(total_multiplier AS DECIMAL(10,6)), 2);
        
        -- User progress'i güncelle (CASE statement ile)
        CASE target_column
            WHEN 't0stl' THEN
                UPDATE user_progress SET t0stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't1stl' THEN
                UPDATE user_progress SET t1stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't2stl' THEN
                UPDATE user_progress SET t2stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't3stl' THEN
                UPDATE user_progress SET t3stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't4stl' THEN
                UPDATE user_progress SET t4stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't5stl' THEN
                UPDATE user_progress SET t5stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't6stl' THEN
                UPDATE user_progress SET t6stl = final_value WHERE user_id = NEW.user_id;
            WHEN 't7stl' THEN
                UPDATE user_progress SET t7stl = final_value WHERE user_id = NEW.user_id;
        END CASE;

        -- Sonucu bir sonraki hafta için temel değer yap
        last_final_value := final_value;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User entries güncellendiğinde tetiklenecek trigger
DROP TRIGGER IF EXISTS trigger_calculate_all_portfolio ON user_entries;
CREATE TRIGGER trigger_calculate_all_portfolio
    AFTER INSERT OR UPDATE ON user_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_all_portfolio_values();

-- Market verileri güncellendiğinde de tetiklenecek trigger
DROP TRIGGER IF EXISTS trigger_calculate_all_portfolio_market ON market;
CREATE TRIGGER trigger_calculate_all_portfolio_market
    AFTER INSERT OR UPDATE ON market
    FOR EACH ROW
    EXECUTE FUNCTION calculate_all_portfolio_values();

-- Tüm kullanıcılar için manuel hesaplama
CREATE OR REPLACE FUNCTION recalculate_all_users()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM user_entries LOOP
        -- Her kullanıcı için tüm hesaplamaları yap
        UPDATE user_entries 
        SET t0percent = t0percent 
        WHERE user_id = user_record.user_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Tek kullanıcı için manuel hesaplama
CREATE OR REPLACE FUNCTION recalculate_user(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE user_entries 
    SET t0percent = t0percent 
    WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql; 