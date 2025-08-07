-- Market güncellendiğinde tüm kullanıcıların portföyünü otomatik güncelle
CREATE OR REPLACE FUNCTION recalculate_all_users_on_market_update()
RETURNS TRIGGER AS $$
DECLARE
    user_rec RECORD;
BEGIN
    FOR user_rec IN SELECT user_id FROM user_entries LOOP
        -- Her kullanıcı için user_entries kaydını tetikle
        UPDATE user_entries
        SET t0percent = t0percent
        WHERE user_id = user_rec.user_id;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eski trigger'ı sil
DROP TRIGGER IF EXISTS trigger_recalculate_on_market ON market;

-- Market tablosu için yeni trigger
CREATE TRIGGER trigger_recalculate_on_market
    AFTER UPDATE ON market
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_all_users_on_market_update(); 