-- Dinamik hesaplama sistemi test
-- Önce mevcut durumu kontrol et
SELECT 
    user_id,
    t0btl,
    t0stl,
    t1stl,
    t2stl,
    t3stl,
    t4stl,
    t5stl,
    t6stl,
    t7stl
FROM user_progress 
WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63';

-- User entries'i kontrol et
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

-- Dinamik hesaplama sistemini kur
-- (dynamic-calculation-system.sql dosyasındaki kodu çalıştırın)

-- Mevcut yatırımı tetikle (tüm sütunları güncelle)
UPDATE user_entries 
SET t0percent = t0percent 
WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63';

-- Sonucu kontrol et
SELECT 
    user_id,
    t0btl,
    t0stl,
    t1stl,
    t2stl,
    t3stl,
    t4stl,
    t5stl,
    t6stl,
    t7stl
FROM user_progress 
WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63';

-- Manuel hesaplama testi (tüm haftalar için)
SELECT 
    'Hafta 1' as hafta,
    100000 * (
        SELECT COALESCE(SUM(
            CASE 
                WHEN m.id = 1 THEN 0.1 * (1 + m.yuzde_t1/100)
                WHEN m.id = 5 THEN 0.8 * (1 + m.yuzde_t1/100)
                WHEN m.id = 12 THEN 0.1 * (1 + m.yuzde_t1/100)
            END
        ), 1)
        FROM market m WHERE m.id IN (1, 5, 12)
    ) as hesaplanan_deger
UNION ALL
SELECT 
    'Hafta 2' as hafta,
    100000 * (
        SELECT COALESCE(SUM(
            CASE 
                WHEN m.id = 1 THEN 0.1 * (1 + m.yuzde_t2/100)
                WHEN m.id = 5 THEN 0.8 * (1 + m.yuzde_t2/100)
                WHEN m.id = 12 THEN 0.1 * (1 + m.yuzde_t2/100)
            END
        ), 1)
        FROM market m WHERE m.id IN (1, 5, 12)
    ) as hesaplanan_deger; 