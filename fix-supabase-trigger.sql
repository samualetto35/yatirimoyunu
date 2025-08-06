-- Önce eski trigger'ı kaldır
DROP TRIGGER IF EXISTS create_user_records_after_verification_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_records_after_verification();

-- Yeni trigger fonksiyonu (Firebase için)
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