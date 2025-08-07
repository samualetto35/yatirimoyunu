-- Test yatırım verisi ekle
UPDATE user_entries 
SET t0percent = '3;0.5 9;0.5'
WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63';

-- Market verilerini kontrol et
SELECT id, baz_cur, yatirim_araci, yuzde_t1, yuzde_t2, yuzde_t3, yuzde_t4, yuzde_t5, yuzde_t6, yuzde_t7, yuzde_t8
FROM market 
WHERE id IN (3, 9);

-- User entries'i kontrol et
SELECT user_id, t0percent, t1percent, t2percent, t3percent, t4percent, t5percent, t6percent, t7percent
FROM user_entries 
WHERE user_id = 'HJdSyLeGtsXXzo6sjmyn2kaAiD63'; 