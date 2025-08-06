-- Market tablosu (CSV'den import edilecek)
CREATE TABLE market (
    id SERIAL PRIMARY KEY,
    baz_cur VARCHAR(10) NOT NULL,
    yatirim_grubu VARCHAR(100) NOT NULL,
    yatirim_araci_kod VARCHAR(20) NOT NULL,
    yatirim_araci VARCHAR(200) NOT NULL,
    yilbasi_getiri DECIMAL(5,2) NOT NULL,
    vergi_orani DECIMAL(5,2) NOT NULL,
    fiyat_t0 DECIMAL(15,3) NOT NULL,
    fiyat_t1 DECIMAL(15,3) NOT NULL,
    yuzde_t1 DECIMAL(5,2) NOT NULL,
    fiyat_t2 DECIMAL(15,3) NOT NULL,
    yuzde_t2 DECIMAL(5,2) NOT NULL,
    fiyat_t3 DECIMAL(15,3) NOT NULL,
    yuzde_t3 DECIMAL(5,2) NOT NULL,
    fiyat_t4 DECIMAL(15,3) NOT NULL,
    yuzde_t4 DECIMAL(5,2) NOT NULL,
    fiyat_t5 DECIMAL(15,3) NOT NULL,
    yuzde_t5 DECIMAL(5,2) NOT NULL,
    fiyat_t6 DECIMAL(15,3) NOT NULL,
    yuzde_t6 DECIMAL(5,2) NOT NULL,
    fiyat_t7 DECIMAL(15,3) NOT NULL,
    yuzde_t7 DECIMAL(5,2) NOT NULL,
    fiyat_t8 DECIMAL(15,3) NOT NULL,
    yuzde_t8 DECIMAL(5,2) NOT NULL,
    fiyat_t9 DECIMAL(15,3) NOT NULL,
    yuzde_t9 DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress tablosu
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    group_name VARCHAR(100),
    t0btl DECIMAL(15,2) NOT NULL DEFAULT 100000,
    t0stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t1stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t2stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t3stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t4stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t5stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t6stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    t7stl DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Entries tablosu
CREATE TABLE user_entries (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    group_name VARCHAR(100),
    t0percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t1percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t2percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t3percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t4percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t5percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t6percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t7percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    t8percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_entries_user_id ON user_entries(user_id);
CREATE INDEX idx_market_yatirim_araci_kod ON market(yatirim_araci_kod);

-- Updated trigger for user_progress
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_entries_updated_at 
    BEFORE UPDATE ON user_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 