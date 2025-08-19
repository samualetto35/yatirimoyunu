-- Admin Week Control Otomatik Doldurma Trigger'ı
-- Herhangi bir hafta =2 olduğunda, o haftaya karşılık gelen user_entries kolonunu kontrol et
-- Boş ise otomatik "27:1" ile doldur (27 = TRY, değişim %0, seçim yapılmamış)

-- Hafta eşleştirmesi:
-- week_1 -> t0percent
-- week_2 -> t1percent  
-- week_3 -> t2percent
-- week_4 -> t3percent
-- week_5 -> t4percent
-- week_6 -> t5percent
-- week_7 -> t6percent
-- week_8 -> t7percent

CREATE OR REPLACE FUNCTION auto_fill_closed_weeks()
RETURNS TRIGGER AS $$
DECLARE
    target_column TEXT;
    sql_query TEXT;
    affected_rows INTEGER;
BEGIN
    -- Week_1 = 2 ise t0percent'i kontrol et
    IF NEW.week_1 = 2 AND (OLD.week_1 IS NULL OR OLD.week_1 != 2) THEN
        target_column := 't0percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 1 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_2 = 2 ise t1percent'i kontrol et
    IF NEW.week_2 = 2 AND (OLD.week_2 IS NULL OR OLD.week_2 != 2) THEN
        target_column := 't1percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 2 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_3 = 2 ise t2percent'i kontrol et
    IF NEW.week_3 = 2 AND (OLD.week_3 IS NULL OR OLD.week_3 != 2) THEN
        target_column := 't2percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 3 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_4 = 2 ise t3percent'i kontrol et
    IF NEW.week_4 = 2 AND (OLD.week_4 IS NULL OR OLD.week_4 != 2) THEN
        target_column := 't3percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 4 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_5 = 2 ise t4percent'i kontrol et
    IF NEW.week_5 = 2 AND (OLD.week_5 IS NULL OR OLD.week_5 != 2) THEN
        target_column := 't4percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 5 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_6 = 2 ise t5percent'i kontrol et
    IF NEW.week_6 = 2 AND (OLD.week_6 IS NULL OR OLD.week_6 != 2) THEN
        target_column := 't5percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 6 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_7 = 2 ise t6percent'i kontrol et
    IF NEW.week_7 = 2 AND (OLD.week_7 IS NULL OR OLD.week_7 != 2) THEN
        target_column := 't6percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 7 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    -- Week_8 = 2 ise t7percent'i kontrol et
    IF NEW.week_8 = 2 AND (OLD.week_8 IS NULL OR OLD.week_8 != 2) THEN
        target_column := 't7percent';
        sql_query := 'UPDATE user_entries SET ' || target_column || ' = ''27:1'' WHERE (' || target_column || ' IS NULL OR ' || target_column || ' = '''')';
        EXECUTE sql_query;
        GET DIAGNOSTICS affected_rows = ROW_COUNT;
        RAISE NOTICE 'Week 8 kapatıldı: % kullanıcının % kolonu "27:1" ile dolduruldu', affected_rows, target_column;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı admin_week_control tablosuna bağla
DROP TRIGGER IF EXISTS trigger_auto_fill_closed_weeks ON admin_week_control;

CREATE TRIGGER trigger_auto_fill_closed_weeks
    AFTER UPDATE ON admin_week_control
    FOR EACH ROW
    WHEN (
        NEW.week_1 = 2 OR NEW.week_2 = 2 OR NEW.week_3 = 2 OR NEW.week_4 = 2 OR 
        NEW.week_5 = 2 OR NEW.week_6 = 2 OR NEW.week_7 = 2 OR NEW.week_8 = 2
    )
    EXECUTE FUNCTION auto_fill_closed_weeks();

-- Test senaryoları:

-- Test 1: Week_3'ü kapat (t2percent doldurulmalı)
-- UPDATE admin_week_control SET week_3 = 2 WHERE id = 1;

-- Test 2: Week_6'yı kapat (t5percent doldurulmalı) 
-- UPDATE admin_week_control SET week_6 = 2 WHERE id = 1;

-- Test 3: Birden fazla haftayı kapat
-- UPDATE admin_week_control SET week_1 = 2, week_4 = 2 WHERE id = 1;

-- Kontrol sorguları:
-- SELECT user_id, user_email, t2percent FROM user_entries WHERE t2percent = '27:1';
-- SELECT user_id, user_email, t5percent FROM user_entries WHERE t5percent = '27:1';

-- Log kontrolü (PostgreSQL log'larında):
-- NOTICE mesajları ile hangi hafta kapatıldığını ve kaç kullanıcının etkilendiğini görebilirsin

-- Manuel test için boş user_entries oluştur:
-- INSERT INTO user_entries (user_id, user_email, t2percent, t5percent) 
-- VALUES ('test-user-1', 'test1@example.com', '', '');

-- Sonra week'i kapat ve otomatik doldurma işlemini gör:
-- UPDATE admin_week_control SET week_3 = 2 WHERE id = 1; 