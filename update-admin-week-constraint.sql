-- Admin Week Control Constraint Update
-- Tablo: admin_week_control
-- Kolonlar: id, group_number, week_1, week_2, week_3, week_4, week_5, week_6, week_7, week_8
-- Yeni kural: Hepsi sıfır olabilir VEYA maksimum 1 tanesi 1 veya 2 olabilir

-- Eski constraint'leri kaldır (tüm olası isimleri dahil)
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_exactly_one_active;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_at_least_one_active;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_max_one_active;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_valid_values;

-- Eski problematik constraint'leri kaldır
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS only_one_week_active;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS week_flags_domain;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS exactly_one_week_nonzero;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS active_week_value;

-- Kolon bazlı eski constraint'leri kaldır
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_1_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_2_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_3_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_4_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_5_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_6_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_7_check;
ALTER TABLE admin_week_control DROP CONSTRAINT IF EXISTS admin_week_control_week_8_check;

-- Yeni constraint ekle: Maksimum 1 tane aktif hafta olabilir (1 veya 2 değeri)
ALTER TABLE admin_week_control ADD CONSTRAINT admin_week_control_max_one_active 
CHECK (
  (
    CASE WHEN week_1 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_2 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_3 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_4 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_5 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_6 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_7 IN (1, 2) THEN 1 ELSE 0 END +
    CASE WHEN week_8 IN (1, 2) THEN 1 ELSE 0 END
  ) <= 1
);

-- Tüm hafta değerlerinin 0, 1 veya 2 olması kuralı
ALTER TABLE admin_week_control ADD CONSTRAINT admin_week_control_valid_values 
CHECK (
  week_1 IN (0, 1, 2) AND
  week_2 IN (0, 1, 2) AND
  week_3 IN (0, 1, 2) AND
  week_4 IN (0, 1, 2) AND
  week_5 IN (0, 1, 2) AND
  week_6 IN (0, 1, 2) AND
  week_7 IN (0, 1, 2) AND
  week_8 IN (0, 1, 2)
);

-- ID ve group_number için constraint'ler (sadece 1 olabilir)
ALTER TABLE admin_week_control ADD CONSTRAINT admin_week_control_id_value 
CHECK (id = 1);

ALTER TABLE admin_week_control ADD CONSTRAINT admin_week_control_group_number_value 
CHECK (group_number = 1);

-- Test: Mevcut verileri kontrol et
SELECT * FROM admin_week_control;

-- Test senaryoları (bunları tek tek test etmek için kullanabilirsin):

-- ✅ ESKİ SORUN ÇÖZÜLDİ: Artık hepsi sıfır olabilir
-- UPDATE admin_week_control SET week_1=0, week_2=0, week_3=0, week_4=0, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- ✅ Geçerli: Sadece week_1 açık (1 = açık)
-- UPDATE admin_week_control SET week_1=1, week_2=0, week_3=0, week_4=0, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- ✅ Geçerli: Sadece week_3 kapalı (2 = kapalı)
-- UPDATE admin_week_control SET week_1=0, week_2=0, week_3=2, week_4=0, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- ✅ ESKİ SORUN ÇÖZÜLDİ: Artık aktif haftayı kapatabilirsin
-- Örnek: week_1 aktifti, şimdi hepsini sıfır yapabiliyoruz
-- UPDATE admin_week_control SET week_1=0, week_2=0, week_3=0, week_4=0, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- ❌ Geçersiz: İki hafta aktif (1 veya 2)
-- UPDATE admin_week_control SET week_1=1, week_2=1, week_3=0, week_4=0, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- ❌ Geçersiz: week_1 açık, week_4 kapalı (iki aktif)
-- UPDATE admin_week_control SET week_1=1, week_2=0, week_3=0, week_4=2, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- ❌ Geçersiz: Geçersiz değer (3)
-- UPDATE admin_week_control SET week_1=3, week_2=0, week_3=0, week_4=0, week_5=0, week_6=0, week_7=0, week_8=0 WHERE id=1;

-- 🔧 ESKİ CONSTRAINT'İN SORUNU:
-- exactly_one_week_nonzero: Kesinlikle 1 tane sıfır olmayan değer zorunlu
-- active_week_value: Toplam mutlaka 1 veya 2 olmalı 
-- BU YÜZDEN haftayı kapatamıyordun (hepsi sıfır olamıyordu)

-- 🚀 YENİ CONSTRAINT'İN AVANTAJI:
-- admin_week_control_max_one_active: Maksimum 1 tane aktif, ama sıfır da olabilir
-- Artık istediğin zaman tüm haftaları kapatabilirsin! 