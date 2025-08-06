-- User Progress tablosu
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    group_name VARCHAR(100),
    t0btl DECIMAL(15,2) NOT NULL DEFAULT 100000,
    t0stl DECIMAL(15,2),
    t1stl DECIMAL(15,2),
    t2stl DECIMAL(15,2),
    t3stl DECIMAL(15,2),
    t4stl DECIMAL(15,2),
    t5stl DECIMAL(15,2),
    t6stl DECIMAL(15,2),
    t7stl DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Entries tablosu
CREATE TABLE user_entries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    group_name VARCHAR(100),
    t0percent VARCHAR(500), -- Format: "1;0.2 4;0.4 12;0.4"
    t1percent VARCHAR(500),
    t2percent VARCHAR(500),
    t3percent VARCHAR(500),
    t4percent VARCHAR(500),
    t5percent VARCHAR(500),
    t6percent VARCHAR(500),
    t7percent VARCHAR(500),
    t8percent VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_entries_user_id ON user_entries(user_id);

-- Updated trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_entries_updated_at 
    BEFORE UPDATE ON user_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own entries" ON user_entries
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own entries" ON user_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own entries" ON user_entries
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Function to create user records after email verification
CREATE OR REPLACE FUNCTION create_user_records_after_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user is email verified
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        -- Insert into user_progress
        INSERT INTO user_progress (user_id, user_email, group_name, t0btl, t0stl, t1stl, t2stl, t3stl, t4stl, t5stl, t6stl, t7stl)
        VALUES (
            NEW.id,
            NEW.email,
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
            NEW.id,
            NEW.email,
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
        
        RAISE NOTICE 'User records created for: %', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user records after email verification
CREATE TRIGGER create_user_records_after_verification_trigger
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_records_after_verification(); 