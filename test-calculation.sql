-- Mevcut yatırım için test hesaplaması (düzeltilmiş)
-- Önce kullanıcının seçimlerini kontrol et
SELECT 
    user_id,
    t0percent,
    t1percent,
    t2percent,
    t3percent,
    t4percent,
    t5percent,
    t6percent,
    t7percent
FROM user_entries 
WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63';

-- Aktif haftayı kontrol et
SELECT 
    week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8
FROM admin_week_control 
WHERE group_number = 1;

-- Yeni hesaplama testi (1. hafta için)
-- Örnek: t0percent = "1;0.1 5;0.8 12;0.1" ise
-- Market ID 1: yuzde_t1 = 6.0% -> 0.1 * (1 + 6.0/100) = 0.1 * 1.06 = 0.106
-- Market ID 5: yuzde_t1 = 2.5% -> 0.8 * (1 + 2.5/100) = 0.8 * 1.025 = 0.82
-- Market ID 12: yuzde_t1 = 3.2% -> 0.1 * (1 + 3.2/100) = 0.1 * 1.032 = 0.1032
-- Toplam: 0.106 + 0.82 + 0.1032 = 1.0292
-- Sonuç: 100000 * 1.0292 = 102,920

-- Test hesaplaması (yeni mantık)
WITH user_selections AS (
    SELECT t0percent FROM user_entries WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63'
),
market_data AS (
    SELECT id, yuzde_t1 FROM market WHERE id IN (1, 5, 12)
)
SELECT 
    'Test Hesaplama (Yeni Mantık)' as description,
    100000 * (
        SELECT COALESCE(SUM(
            CASE 
                WHEN m.id = 1 THEN 0.1 * (1 + m.yuzde_t1/100)
                WHEN m.id = 5 THEN 0.8 * (1 + m.yuzde_t1/100)
                WHEN m.id = 12 THEN 0.1 * (1 + m.yuzde_t1/100)
            END
        ), 1)
        FROM market_data m
    ) as calculated_value; 