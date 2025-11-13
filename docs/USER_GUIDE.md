# 👤 User Guide - BILAN-EASY Dashboard

Bu rehber, BILAN-EASY dashboard'unu kullanarak bilan de compétences sürecinizi yönetmenize yardımcı olur.

---

## 🚀 Başlangıç

### 1. Giriş Yapma

1. Dashboard'a gidin: `http://localhost:3000`
2. **Login** sayfasında email ve şifrenizi girin
3. **Login** butonuna tıklayın

### 2. İlk Kullanıcı Kaydı

Eğer hesabınız yoksa:

1. **Register** sayfasına gidin
2. Email, şifre ve isim bilgilerinizi girin
3. **Register** butonuna tıklayın
4. Otomatik olarak giriş yapılacaksınız

---

## 📊 Dashboard Ana Sayfa

Dashboard ana sayfasında şunları görebilirsiniz:

- **Total Assessments**: Toplam bilan sayınız
- **Completed**: Tamamlanan bilanlar
- **In Progress**: Devam eden bilanlar
- **Analytics**: Analytics sayfasına hızlı erişim

### Quick Actions

- **Start New Assessment**: Yeni bir bilan başlat
- **View All Assessments**: Tüm bilanlarınızı görüntüle
- **View Analytics**: Analytics dashboard'unu aç

### Recent Activity

Son 5 bilan aktivitenizi görebilirsiniz.

---

## 📝 Bilan Oluşturma

### 1. Yeni Bilan Başlatma

1. Dashboard'dan **"Start New Assessment"** butonuna tıklayın
2. Veya sidebar'dan **"Bilan de Compétences"** menüsüne gidin

### 2. Paket Seçimi

3 farklı paket seçeneği vardır:

- **Découverte** (8 saat): Hızlı bir değerlendirme
- **Approfondi** (16 saat): Detaylı analiz
- **Stratégique** (24 saat): Kapsamlı stratejik değerlendirme

### 3. Coaching Style Seçimi

3 farklı coaching style seçebilirsiniz:

- **Collaboratif**: İşbirlikçi ve destekleyici
- **Analytique**: Analitik ve veri odaklı
- **Créatif**: Yaratıcı ve esnek

### 4. Kişiselleştirme

CV veya LinkedIn profilinizi yapıştırarak daha kişiselleştirilmiş sorular alabilirsiniz.

### 5. Soruları Cevaplama

- Soruları metin olarak yazabilir veya sesli olarak cevaplayabilirsiniz
- Her soru için yeterli zaman ayırın
- İstediğiniz zaman ara verebilirsiniz

### 6. Cevap Düzenleme

- Önceki cevaplarınızı düzenlemek için:
  1. Soru-cevap geçmişinde **"Edit"** butonuna tıklayın
  2. Cevabınızı güncelleyin
  3. **"Save"** butonuna tıklayın

### 7. Taslak Kaydetme

- **"Sauvegarder"** butonuna tıklayarak manuel olarak taslak kaydedebilirsiniz
- Sistem otomatik olarak her 5 soruda bir taslak kaydeder
- Taslaklar **"My Assessments"** sayfasında görünür

---

## 📋 Assessment Yönetimi

### Assessments Listesi

1. Sidebar'dan **"Assessments"** menüsüne gidin
2. Tüm bilanlarınızı görebilirsiniz:
   - **Status**: completed, in_progress, abandoned
   - **Progress**: Tamamlanma yüzdesi
   - **Started At**: Başlangıç tarihi

### Devam Eden Bilan

1. **"My Assessments"** sayfasında **"In Progress"** bölümüne gidin
2. Devam etmek istediğiniz bilanın yanındaki **"Continue"** butonuna tıklayın
3. Kaldığınız yerden devam edin

### Bilan Detayları

1. Assessment listesinde bir bilanın yanındaki **"View"** butonuna tıklayın
2. Bilan detaylarını, cevapları ve özeti görebilirsiniz

---

## 📊 Analytics Dashboard

### Analytics'e Erişim

1. Sidebar'dan **"Analytics"** menüsüne gidin
2. Veya Dashboard'dan **"View Analytics"** butonuna tıklayın

### Analytics Metrikleri

- **Overview**: Toplam bilan sayısı, tamamlama oranları
- **Package Distribution**: Paket dağılımı grafiği
- **Coaching Style Distribution**: Coaching style dağılımı
- **Drop-off Analysis**: Hangi aşamada bırakıldığı analizi

### Tarih Filtreleme

- **Start Date** ve **End Date** seçerek belirli bir tarih aralığına göre filtreleyebilirsiniz

---

## 📤 Export İşlemleri

### CSV Export

1. Bilan tamamlandıktan sonra **Summary Dashboard**'da
2. **"Export CSV"** butonuna tıklayın
3. CSV dosyası indirilecektir

### JSON Export

1. **"Export JSON"** butonuna tıklayın
2. JSON dosyası indirilecektir (tüm metadata ile)

### PDF Export

1. **"Export PDF"** butonuna tıklayın
2. PDF dosyası oluşturulacak ve indirilecektir

---

## 🌐 Dil Değiştirme

1. Header'daki **Language Switcher**'a tıklayın
2. İstediğiniz dili seçin:
   - 🇫🇷 Français
   - 🇬🇧 English
   - 🇩🇪 Deutsch
   - 🇹🇷 Türkçe

---

## 🎨 Tema Değiştirme

1. Header'daki **Theme Toggle** butonuna tıklayın
2. **Light** veya **Dark** tema arasında geçiş yapın

---

## 👤 Profil ve Ayarlar

### Kullanıcı Menüsü

1. Header'daki **Avatar**'a tıklayın
2. Menüden seçenekleri görebilirsiniz:
   - **Profile**: Profil bilgileri (yakında)
   - **Settings**: Ayarlar (yakında)
   - **Logout**: Çıkış yap

---

## ❓ Sık Sorulan Sorular

### Bilan'ı yarıda bırakabilir miyim?

Evet! Sistem otomatik olarak her 5 soruda bir taslak kaydeder. İstediğiniz zaman **"My Assessments"** sayfasından devam edebilirsiniz.

### Önceki cevaplarımı değiştirebilir miyim?

Evet! Soru-cevap geçmişinde her cevabın yanında **"Edit"** butonu vardır. Tıklayarak cevabınızı düzenleyebilirsiniz.

### Bilan'ı silmek istersem?

Assessment listesinde bir bilanın yanındaki **"Delete"** butonuna tıklayabilirsiniz (eğer yetkiniz varsa).

### Export dosyalarında hangi bilgiler var?

- **CSV**: Soru numarası, soru metni, cevap, soru tipi, tema, seçenekler
- **JSON**: Tüm metadata, kullanıcı bilgileri, tarih bilgileri
- **PDF**: Özet rapor ve görselleştirmeler

---

## 🆘 Yardım ve Destek

Sorun yaşarsanız:

1. **Error messages** okuyun - genellikle sorunu açıklar
2. **Retry** butonuna tıklayarak tekrar deneyin
3. Sayfayı yenileyin (F5)
4. Admin ile iletişime geçin

---

**Son Güncelleme:** 12 Kasım 2024

