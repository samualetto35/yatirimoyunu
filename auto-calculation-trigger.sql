-- Otomatik hesaplama fonksiyonu (düzeltilmiş)
CREATE OR REPLACE FUNCTION calculate_portfolio_value()
RETURNS TRIGGER AS $$
DECLARE
    user_progress_record RECORD;
    user_entries_record RECORD;
    total_multiplier DECIMAL(10,6) := 0;
    percent_parts TEXT[];
    part TEXT;
    investment_id INTEGER;
    investment_percentage DECIMAL(10,4);
    market_percentage DECIMAL(10,4);
    week_number INTEGER;
    target_column TEXT;
    base_value DECIMAL(10,2);
BEGIN
    -- Hangi hafta aktif olduğunu bul
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
        END INTO week_number
    FROM admin_week_control 
    WHERE group_number = 1;
    
    -- Hangi sütunun güncelleneceğini belirle
    target_column := 't' || (week_number - 1) || 'stl';
    
    -- User progress ve entries kayıtlarını al
    SELECT * INTO user_progress_record 
    FROM user_progress 
    WHERE user_id = NEW.user_id;
    
    SELECT * INTO user_entries_record 
    FROM user_entries 
    WHERE user_id = NEW.user_id;
    
    -- Eğer ilgili percent sütunu boşsa işlem yapma
    IF user_entries_record IS NULL OR 
       (week_number = 1 AND user_entries_record.t0percent IS NULL) OR
       (week_number = 2 AND user_entries_record.t1percent IS NULL) OR
       (week_number = 3 AND user_entries_record.t2percent IS NULL) OR
       (week_number = 4 AND user_entries_record.t3percent IS NULL) OR
       (week_number = 5 AND user_entries_record.t4percent IS NULL) OR
       (week_number = 6 AND user_entries_record.t5percent IS NULL) OR
       (week_number = 7 AND user_entries_record.t6percent IS NULL) OR
       (week_number = 8 AND user_entries_record.t7percent IS NULL) THEN
        RETURN NEW;
    END IF;
    
    -- Base value'yu belirle (önceki haftanın değeri veya t0btl)
    IF week_number = 1 THEN
        base_value := user_progress_record.t0btl;
    ELSE
        EXECUTE format('SELECT t%sstl INTO base_value FROM user_progress WHERE user_id = %L', 
                      week_number - 1, NEW.user_id);
        IF base_value IS NULL THEN
            base_value := user_progress_record.t0btl;
        END IF;
    END IF;
    
    -- Percent string'ini parçala (örn: "1;0.1 5;0.8 12;0.1")
    percent_parts := string_to_array(
        CASE 
            WHEN week_number = 1 THEN user_entries_record.t0percent
            WHEN week_number = 2 THEN user_entries_record.t1percent
            WHEN week_number = 3 THEN user_entries_record.t2percent
            WHEN week_number = 4 THEN user_entries_record.t3percent
            WHEN week_number = 5 THEN user_entries_record.t4percent
            WHEN week_number = 6 THEN user_entries_record.t5percent
            WHEN week_number = 7 THEN user_entries_record.t6percent
            WHEN week_number = 8 THEN user_entries_record.t7percent
        END, 
        ' '
    );
    
    -- Her yatırım için hesaplama yap
    FOREACH part IN ARRAY percent_parts
    LOOP
        -- ID ve yüzdeyi ayır (örn: "1;0.1" -> investment_id=1, percentage=0.1)
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
            -- Yeni hesaplama: investment_percentage * (1 + market_percentage/100)
            total_multiplier := total_multiplier + (investment_percentage * (1 + market_percentage/100));
        ELSE
            -- Market verisi yoksa sadece yüzdeyi ekle
            total_multiplier := total_multiplier + investment_percentage;
        END IF;
    END LOOP;
    
    -- User progress'i güncelle
    EXECUTE format('UPDATE user_progress SET %I = %L * %L WHERE user_id = %L', 
                   target_column, 
                   base_value,
                   total_multiplier,
                   NEW.user_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User entries güncellendiğinde tetiklenecek trigger
DROP TRIGGER IF EXISTS trigger_calculate_portfolio ON user_entries;
CREATE TRIGGER trigger_calculate_portfolio
    AFTER UPDATE ON user_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_portfolio_value();

-- Market verileri güncellendiğinde de tetiklenecek trigger
DROP TRIGGER IF EXISTS trigger_calculate_portfolio_market ON market;
CREATE TRIGGER trigger_calculate_portfolio_market
    AFTER UPDATE ON market
    FOR EACH ROW
    EXECUTE FUNCTION calculate_portfolio_value();

-- Test için manuel hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION manual_calculate_all_users()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM user_entries LOOP
        -- Her kullanıcı için hesaplama yap
        PERFORM calculate_portfolio_value();
    END LOOP;
END;
$$ LANGUAGE plpgsql; 