-- Önce mevcut policies'leri kaldır
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view own entries" ON user_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON user_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON user_entries;

-- Yeni policies oluştur (Firebase için)
-- Firebase kullandığımız için auth.uid() yerine user_id kullanıyoruz
CREATE POLICY "Enable all operations for user_progress" ON user_progress
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for user_entries" ON user_entries
    FOR ALL USING (true) WITH CHECK (true);

-- Alternatif olarak, sadece belirli user_id'ler için izin ver
-- CREATE POLICY "Users can access own progress" ON user_progress
--     FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
--     WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- CREATE POLICY "Users can access own entries" ON user_entries
--     FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
--     WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub'); 