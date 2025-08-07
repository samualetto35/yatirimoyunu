-- Market tablosu için RLS politikalarını kontrol et ve düzelt
-- Önce mevcut politikaları kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'market';

-- Market tablosu için RLS'yi kapat (test için)
ALTER TABLE market DISABLE ROW LEVEL SECURITY;

-- Veya market tablosu için herkese okuma izni ver
DROP POLICY IF EXISTS "Enable read access for all users" ON market;
CREATE POLICY "Enable read access for all users" ON market
  FOR SELECT USING (true);

-- Market tablosundaki veri sayısını kontrol et
SELECT COUNT(*) FROM market;

-- İlk 5 satırı göster
SELECT id, baz_cur, yatirim_grubu, yatirim_araci_kod, yatirim_araci 
FROM market 
LIMIT 5; 