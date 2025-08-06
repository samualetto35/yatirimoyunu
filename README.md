# Yatirim Oyunu 1.0 🎯

Modern web teknolojileri ile geliştirilmiş yatırım oyunu. Firebase Authentication ve Supabase Database kullanarak güvenli ve ölçeklenebilir bir sistem.

## 🚀 Özellikler

### **Authentication & Security**
- ✅ Firebase Authentication
- ✅ Email verification
- ✅ Password reset
- ✅ Protected routes
- ✅ Multi-user support

### **Database & Data Management**
- ✅ Supabase PostgreSQL
- ✅ User progress tracking
- ✅ Investment entries
- ✅ Market data integration
- ✅ Row Level Security (RLS)

### **UI/UX**
- ✅ Modern responsive design
- ✅ Mobile-friendly interface
- ✅ Turkish language support
- ✅ Real-time feedback
- ✅ Loading states

## 🛠️ Teknoloji Stack

- **Frontend:** React.js + TypeScript
- **Authentication:** Firebase Auth
- **Database:** Supabase PostgreSQL
- **Routing:** React Router DOM
- **Styling:** CSS3 + Media Queries
- **State Management:** React Context API

## 📊 Database Yapısı

### **Tables:**
- `market` - Market verileri (CSV import)
- `user_progress` - Kullanıcı ilerleme verileri
- `user_entries` - Kullanıcı yatırım girişleri

### **Security:**
- Row Level Security (RLS) policies
- Firebase UID filtering
- Email verification required

## 🚀 Kurulum

### **1. Repository'yi Klonlayın:**
```bash
git clone https://github.com/YOUR_USERNAME/yatirimoyunu.git
cd yatirimoyunu
```

### **2. Dependencies'leri Yükleyin:**
```bash
npm install
```

### **3. Environment Variables:**
`.env` dosyası oluşturun:
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **4. Database Setup:**
Supabase SQL Editor'da `user-progress-entries-setup.sql` dosyasını çalıştırın.

### **5. Uygulamayı Başlatın:**
```bash
npm start
```

## 📱 Kullanım

### **Kayıt Olma:**
1. `/register` sayfasına gidin
2. Email ve şifre girin
3. Email doğrulamasını yapın

### **Giriş Yapma:**
1. `/login` sayfasına gidin
2. Email ve şifre girin
3. Dashboard'a yönlendirilirsiniz

### **Kullanıcı Dashboard:**
- `/user` sayfasında kendi verilerinizi görün
- Otomatik kayıt oluşturma
- Güvenli veri izolasyonu

## 🔒 Güvenlik

- **Authentication:** Firebase Auth ile güvenli kimlik doğrulama
- **Authorization:** Protected routes ile sayfa erişim kontrolü
- **Data Isolation:** Her kullanıcı sadece kendi verilerini görür
- **Database Security:** RLS policies ile veri güvenliği

## 📈 Versiyon Geçmişi

### **v1.0 - Initial Release**
- ✅ Firebase Authentication sistemi
- ✅ Supabase Database entegrasyonu
- ✅ User progress & entries management
- ✅ Protected routes & user dashboard
- ✅ Mobile responsive design
- ✅ Turkish language support
- ✅ Automatic database record creation
- ✅ Multi-user support & security

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Developer:** [Your Name]
- **Email:** [your.email@example.com]
- **GitHub:** [@your-username]

---

**Yatirim Oyunu 1.0** - Modern web teknolojileri ile geliştirilmiş güvenli yatırım oyunu platformu. 🚀
