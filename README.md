# Yatırım Oyunu - React Authentication App

Bu proje, Firebase Authentication kullanarak kullanıcı kayıt, giriş ve e-posta doğrulama özelliklerini içeren modern bir React uygulamasıdır.

## Özellikler

- ✅ Kullanıcı kayıt ve giriş
- ✅ E-posta doğrulama (OTP ve link ile)
- ✅ Güvenli rota koruması
- ✅ Modern, temiz tasarım
- ✅ Responsive tasarım
- ✅ Türkçe arayüz
- ✅ Detaylı log mesajları
- ✅ Supabase Database entegrasyonu
- ✅ Otomatik kullanıcı kayıt sistemi

## Kurulum

### 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. Yeni proje oluşturun
3. Authentication'ı etkinleştirin
4. Email/Password sağlayıcısını etkinleştirin
5. Proje ayarlarından Firebase config bilgilerini alın

### 2. Firebase Konfigürasyonu

`src/firebase.ts` dosyasını düzenleyin:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Supabase Projesi Oluşturma

1. [Supabase Console](https://supabase.com/)'a gidin
2. Yeni proje oluşturun
3. SQL Editor'da `database-setup.sql` dosyasındaki SQL'i çalıştırın
4. Proje ayarlarından API anahtarlarını alın

### 4. Supabase Konfigürasyonu

`src/supabase.ts` dosyasını düzenleyin:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 5. Market Verilerini Import Etme

1. Supabase Dashboard'da Table Editor'a gidin
2. `market` tablosunu seçin
3. `market_rows.csv` dosyasını import edin

### 6. Bağımlılıkları Yükleme

```bash
npm install
```

### 7. Uygulamayı Çalıştırma

```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Database Yapısı

### Market Tablosu
- CSV'den import edilen market verileri
- Yatırım araçları ve fiyat geçmişi

### User Progress Tablosu
- Kullanıcı bakiyeleri (t0btl, t0stl, t1stl, ...)
- Otomatik olarak yeni kullanıcılar için oluşturulur

### User Entries Tablosu
- Kullanıcı yüzde tercihleri (t0percent, t1percent, ...)
- Gelecekteki hesaplamalar için kullanılacak

## Kullanım

### Kayıt Olma
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. E-posta ve şifre bilgilerinizi girin
3. Kayıt işlemi tamamlandıktan sonra database kayıtları otomatik oluşturulur
4. E-posta doğrulama sayfasına yönlendirileceksiniz

### E-posta Doğrulama
1. E-postanızı kontrol edin
2. Doğrulama linkine tıklayın
3. Doğrulama tamamlandıktan sonra kullanıcı sayfasına yönlendirileceksiniz

### Giriş Yapma
1. "Oturum Aç" butonuna tıklayın
2. E-posta ve şifre bilgilerinizi girin
3. Başarılı giriş sonrası kullanıcı sayfasına yönlendirileceksiniz

## Proje Yapısı

```
src/
├── components/
│   ├── Header.tsx          # Navigasyon başlığı
│   ├── Login.tsx           # Giriş sayfası
│   ├── Register.tsx        # Kayıt sayfası
│   ├── VerifyEmail.tsx     # E-posta doğrulama
│   ├── UserPage.tsx        # Kullanıcı sayfası
│   ├── PrivateRoute.tsx    # Korumalı rota
│   ├── Header.css          # Başlık stilleri
│   ├── Auth.css            # Kimlik doğrulama stilleri
│   └── UserPage.css        # Kullanıcı sayfası stilleri
├── contexts/
│   └── AuthContext.tsx     # Kimlik doğrulama bağlamı
├── services/
│   └── databaseService.ts  # Database servisleri
├── firebase.ts             # Firebase konfigürasyonu
├── supabase.ts             # Supabase konfigürasyonu
├── App.tsx                 # Ana uygulama bileşeni
└── App.css                 # Ana uygulama stilleri
```

## Güvenlik Özellikleri

- E-posta doğrulama zorunlu
- Güçlü şifre gereksinimleri
- Oturum yönetimi
- Korumalı rotalar
- Hata mesajları ve loglama
- Database güvenliği

## Teknolojiler

- React 18
- TypeScript
- Firebase Authentication
- Supabase Database
- React Router DOM
- CSS3

## Geliştirme

### Log Mesajları
Uygulama, tüm kimlik doğrulama işlemlerini konsola loglar:
- Kayıt denemeleri
- Giriş denemeleri
- E-posta doğrulama işlemleri
- Database işlemleri
- Hata durumları

### Hata Yönetimi
- Kullanıcı dostu hata mesajları
- Firebase hata kodlarının Türkçe çevirileri
- Database hata yönetimi
- Başarı mesajları

## Lisans

MIT
