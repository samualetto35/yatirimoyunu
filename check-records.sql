-- User Progress kayıtlarını kontrol et
SELECT * FROM user_progress WHERE user_id = '0WjYDu8d4PYBspA4LQvnqqjB0nC3';

-- User Entries kayıtlarını kontrol et
SELECT * FROM user_entries WHERE user_id = '0WjYDu8d4PYBspA4LQvnqqjB0nC3';

-- Tüm kayıt sayılarını göster
SELECT 'user_progress' as table_name, COUNT(*) as count FROM user_progress;
SELECT 'user_entries' as table_name, COUNT(*) as count FROM user_entries;

-- Son oluşturulan kayıtları göster
SELECT user_id, user_email, t0btl, t0stl, created_at 
FROM user_progress 
ORDER BY created_at DESC 
LIMIT 5;

SELECT user_id, user_email, t0percent, t1percent, created_at 
FROM user_entries 
ORDER BY created_at DESC 
LIMIT 5; 