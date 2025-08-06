-- Mevcut tabloları güncelle

-- User Progress tablosunu güncelle
ALTER TABLE user_progress 
ALTER COLUMN t0stl DROP NOT NULL,
ALTER COLUMN t1stl DROP NOT NULL,
ALTER COLUMN t2stl DROP NOT NULL,
ALTER COLUMN t3stl DROP NOT NULL,
ALTER COLUMN t4stl DROP NOT NULL,
ALTER COLUMN t5stl DROP NOT NULL,
ALTER COLUMN t6stl DROP NOT NULL,
ALTER COLUMN t7stl DROP NOT NULL;

-- User Entries tablosunu güncelle
ALTER TABLE user_entries 
ALTER COLUMN t0percent TYPE VARCHAR(500),
ALTER COLUMN t1percent TYPE VARCHAR(500),
ALTER COLUMN t2percent TYPE VARCHAR(500),
ALTER COLUMN t3percent TYPE VARCHAR(500),
ALTER COLUMN t4percent TYPE VARCHAR(500),
ALTER COLUMN t5percent TYPE VARCHAR(500),
ALTER COLUMN t6percent TYPE VARCHAR(500),
ALTER COLUMN t7percent TYPE VARCHAR(500),
ALTER COLUMN t8percent TYPE VARCHAR(500);

-- Mevcut kayıtları güncelle (stl değerlerini NULL yap)
UPDATE user_progress 
SET 
    t0stl = NULL,
    t1stl = NULL,
    t2stl = NULL,
    t3stl = NULL,
    t4stl = NULL,
    t5stl = NULL,
    t6stl = NULL,
    t7stl = NULL;

-- Mevcut kayıtları güncelle (percent değerlerini NULL yap)
UPDATE user_entries 
SET 
    t0percent = NULL,
    t1percent = NULL,
    t2percent = NULL,
    t3percent = NULL,
    t4percent = NULL,
    t5percent = NULL,
    t6percent = NULL,
    t7percent = NULL,
    t8percent = NULL;

-- Trigger fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION create_user_records_for_firebase_user(
    p_user_id VARCHAR,
    p_user_email VARCHAR
)
RETURNS VOID AS $$
BEGIN
    -- Check if user records already exist
    IF NOT EXISTS (SELECT 1 FROM user_progress WHERE user_id = p_user_id) THEN
        -- Insert into user_progress
        INSERT INTO user_progress (user_id, user_email, group_name, t0btl, t0stl, t1stl, t2stl, t3stl, t4stl, t5stl, t6stl, t7stl)
        VALUES (
            p_user_id,
            p_user_email,
            NULL, -- group_name şimdilik boş
            100000, -- t0btl başlangıç bakiyesi
            NULL, -- t0stl boş
            NULL, -- t1stl boş
            NULL, -- t2stl boş
            NULL, -- t3stl boş
            NULL, -- t4stl boş
            NULL, -- t5stl boş
            NULL, -- t6stl boş
            NULL  -- t7stl boş
        );
        
        -- Insert into user_entries
        INSERT INTO user_entries (user_id, user_email, group_name, t0percent, t1percent, t2percent, t3percent, t4percent, t5percent, t6percent, t7percent, t8percent)
        VALUES (
            p_user_id,
            p_user_email,
            NULL, -- group_name şimdilik boş
            NULL, -- t0percent boş
            NULL, -- t1percent boş
            NULL, -- t2percent boş
            NULL, -- t3percent boş
            NULL, -- t4percent boş
            NULL, -- t5percent boş
            NULL, -- t6percent boş
            NULL, -- t7percent boş
            NULL  -- t8percent boş
        );
        
        RAISE NOTICE 'User records created for Firebase user: %', p_user_email;
    ELSE
        RAISE NOTICE 'User records already exist for: %', p_user_email;
    END IF;
END;
$$ LANGUAGE plpgsql; 