-- Markette haftalık yüzde değişiminde ilgili user_progress sütununu otomatik güncelle
CREATE OR REPLACE FUNCTION recalculate_week_on_market_update()
RETURNS TRIGGER AS $$
DECLARE
    week_number INTEGER := NULL;
    user_rec RECORD;
    percent_string TEXT;
    base_value DECIMAL(10,2);
    percent_parts TEXT[];
    part TEXT;
    investment_id INTEGER;
    investment_percentage DECIMAL(10,4);
    market_percentage DECIMAL(10,4);
    total_multiplier DECIMAL(10,6);
    final_value DECIMAL(10,2);
    target_column TEXT;
BEGIN
    -- Hangi hafta değişti?
    IF OLD.yuzde_t1 IS DISTINCT FROM NEW.yuzde_t1 THEN
        week_number := 1;
    ELSIF OLD.yuzde_t2 IS DISTINCT FROM NEW.yuzde_t2 THEN
        week_number := 2;
    ELSIF OLD.yuzde_t3 IS DISTINCT FROM NEW.yuzde_t3 THEN
        week_number := 3;
    ELSIF OLD.yuzde_t4 IS DISTINCT FROM NEW.yuzde_t4 THEN
        week_number := 4;
    ELSIF OLD.yuzde_t5 IS DISTINCT FROM NEW.yuzde_t5 THEN
        week_number := 5;
    ELSIF OLD.yuzde_t6 IS DISTINCT FROM NEW.yuzde_t6 THEN
        week_number := 6;
    ELSIF OLD.yuzde_t7 IS DISTINCT FROM NEW.yuzde_t7 THEN
        week_number := 7;
    ELSIF OLD.yuzde_t8 IS DISTINCT FROM NEW.yuzde_t8 THEN
        week_number := 8;
    ELSE
        RETURN NEW;
    END IF;

    IF week_number IS NULL THEN
        RETURN NEW;
    END IF;

    target_column := format('t%sstl', week_number-1);

    -- Tüm kullanıcılar için ilgili haftayı yeniden hesapla
    FOR user_rec IN SELECT user_id FROM user_entries LOOP
        -- Base value: ilk hafta t0btl, diğer haftalar bir önceki haftanın stl'si
        IF week_number = 1 THEN
            SELECT t0btl INTO base_value FROM user_progress WHERE user_id = user_rec.user_id;
        ELSE
            EXECUTE format('SELECT t%sstl FROM user_progress WHERE user_id = %L', week_number-2, user_rec.user_id) INTO base_value;
            IF base_value IS NULL THEN
                SELECT t0btl INTO base_value FROM user_progress WHERE user_id = user_rec.user_id;
            END IF;
        END IF;

        -- İlgili percent string'ini al
        percent_string := CASE 
            WHEN week_number = 1 THEN (SELECT t0percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 2 THEN (SELECT t1percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 3 THEN (SELECT t2percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 4 THEN (SELECT t3percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 5 THEN (SELECT t4percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 6 THEN (SELECT t5percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 7 THEN (SELECT t6percent FROM user_entries WHERE user_id = user_rec.user_id)
            WHEN week_number = 8 THEN (SELECT t7percent FROM user_entries WHERE user_id = user_rec.user_id)
        END;

        IF base_value IS NULL OR percent_string IS NULL OR percent_string = '' THEN
            CONTINUE;
        END IF;

        percent_parts := string_to_array(percent_string, ' ');
        total_multiplier := 0;

        FOREACH part IN ARRAY percent_parts
        LOOP
            investment_id := CAST(split_part(part, ';', 1) AS INTEGER);
            investment_percentage := CAST(split_part(part, ';', 2) AS DECIMAL(10,4));
            -- Market'ten ilgili haftanın yüzdesini al
            market_percentage := CASE 
                WHEN week_number = 1 THEN NEW.yuzde_t1
                WHEN week_number = 2 THEN NEW.yuzde_t2
                WHEN week_number = 3 THEN NEW.yuzde_t3
                WHEN week_number = 4 THEN NEW.yuzde_t4
                WHEN week_number = 5 THEN NEW.yuzde_t5
                WHEN week_number = 6 THEN NEW.yuzde_t6
                WHEN week_number = 7 THEN NEW.yuzde_t7
                WHEN week_number = 8 THEN NEW.yuzde_t8
            END;

            IF market_percentage IS NOT NULL THEN
                total_multiplier := total_multiplier + (investment_percentage * (1 + market_percentage/100));
            ELSE
                total_multiplier := total_multiplier + investment_percentage;
            END IF;
        END LOOP;

        final_value := CAST(base_value AS DECIMAL(10,2)) * CAST(total_multiplier AS DECIMAL(10,6));

        -- User progress'i güncelle
        EXECUTE format('UPDATE user_progress SET %I = %s WHERE user_id = %L', 
                       target_column, 
                       final_value,
                       user_rec.user_id);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recalc_week_on_market ON market;

CREATE TRIGGER trigger_recalc_week_on_market
    AFTER UPDATE ON market
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_week_on_market_update(); 