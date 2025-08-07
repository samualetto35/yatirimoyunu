-- Admin hafta kontrolü table'ı
CREATE TABLE IF NOT EXISTS admin_week_control (
  id SERIAL PRIMARY KEY,
  group_number INTEGER DEFAULT 1,
  week_1 INTEGER DEFAULT 0 CHECK (week_1 IN (0, 1)),
  week_2 INTEGER DEFAULT 0 CHECK (week_2 IN (0, 1)),
  week_3 INTEGER DEFAULT 0 CHECK (week_3 IN (0, 1)),
  week_4 INTEGER DEFAULT 0 CHECK (week_4 IN (0, 1)),
  week_5 INTEGER DEFAULT 0 CHECK (week_5 IN (0, 1)),
  week_6 INTEGER DEFAULT 0 CHECK (week_6 IN (0, 1)),
  week_7 INTEGER DEFAULT 0 CHECK (week_7 IN (0, 1)),
  week_8 INTEGER DEFAULT 0 CHECK (week_8 IN (0, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Sadece bir hafta aktif olabilir constraint
  CONSTRAINT only_one_week_active CHECK (
    (week_1 + week_2 + week_3 + week_4 + week_5 + week_6 + week_7 + week_8) = 1
  )
);

-- İlk satırı ekle (varsayılan olarak 1. hafta aktif)
INSERT INTO admin_week_control (group_number, week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8)
VALUES (1, 1, 0, 0, 0, 0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_week_control_updated_at
    BEFORE UPDATE ON admin_week_control
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS'yi kapat
ALTER TABLE admin_week_control DISABLE ROW LEVEL SECURITY;

-- Kontrol et
SELECT * FROM admin_week_control; 