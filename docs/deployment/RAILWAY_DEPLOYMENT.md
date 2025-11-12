# 🚂 Railway Deployment Guide - Beta Test

Bu guide, BILAN-EASY projesini Railway üzerinde beta test için deploy etmek için adım adım talimatlar içerir.

## 🎯 Neden Railway?

✅ **Docker Compose Desteği**: Mevcut `docker-compose.yml` dosyanızı direkt kullanabilirsiniz  
✅ **PostgreSQL Dahil**: Ayrı database servisi kurmaya gerek yok  
✅ **Kolay Kurulum**: GitHub bağlantısı ile otomatik deploy  
✅ **Düşük Maliyet**: Beta test için $5-20/ay  
✅ **Production'a Geçiş**: Aynı platform, sadece plan upgrade  

## 📋 Ön Gereksinimler

- [ ] GitHub hesabı
- [ ] Railway hesabı (https://railway.app - GitHub ile giriş yap)
- [ ] API key'ler hazır (Gemini, OpenAI, Claude)

## 🚀 Adım Adım Deployment

### 1. Railway Hesabı Oluştur

1. https://railway.app adresine git
2. "Start a New Project" butonuna tıkla
3. GitHub ile giriş yap
4. Railway'e GitHub repository erişimi ver

### 2. Yeni Proje Oluştur

1. Railway dashboard'da "New Project" butonuna tıkla
2. "Deploy from GitHub repo" seçeneğini seç
3. Repository'yi seç: `bilan-final-full`
4. Railway otomatik olarak `docker-compose.yml` dosyasını algılar

### 3. Environment Variables Ekle

Railway dashboard'da "Variables" sekmesine git ve şu değişkenleri ekle:

#### Frontend Variables
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here  # Opsiyonel
VITE_CLAUDE_API_KEY=your_claude_api_key_here  # Opsiyonel
VITE_GEMINI_MAX_CONCURRENCY=2
VITE_GEMINI_FALLBACK_MODEL=gemini-1.5-flash  # Opsiyonel
```

#### Backend Variables
```bash
POSTGRES_USER=bilan_user
POSTGRES_PASSWORD=your_strong_password_here  # Güçlü şifre oluştur
POSTGRES_DB=bilan_easy
DATABASE_URL=postgresql://bilan_user:your_strong_password_here@postgres:5432/bilan_easy
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.railway.app  # Railway otomatik URL'i verir
TEST_MODE=false
GEMINI_MAX_CONCURRENCY=2
GEMINI_FALLBACK_MODEL=gemini-1.5-flash  # Opsiyonel
```

**Not:** Railway PostgreSQL servisi için `DATABASE_URL` otomatik olarak oluşturulur. Yukarıdaki `DATABASE_URL` örneği sadece referans içindir.

### 4. PostgreSQL Servisi Ekle

1. Railway dashboard'da "New" butonuna tıkla
2. "Database" > "Add PostgreSQL" seç
3. Railway otomatik olarak PostgreSQL servisi oluşturur
4. PostgreSQL servisinin `DATABASE_URL` environment variable'ını backend servisine bağla

### 5. Servisleri Yapılandır

Railway otomatik olarak `docker-compose.yml` dosyasındaki servisleri algılar:
- `frontend` - Nginx ile serve edilen React app
- `backend` - Hono.js API
- `postgres` - PostgreSQL database

Her servis için:
1. Servis adına tıkla
2. "Settings" sekmesinde port ve environment variables kontrol et
3. "Deploy" butonuna tıkla

### 6. Custom Domain Ekle (Opsiyonel)

1. Railway dashboard'da projeye git
2. "Settings" > "Domains" sekmesine git
3. "Generate Domain" butonuna tıkla (örn: `bilan-final-full-production.up.railway.app`)
4. Veya kendi domain'inizi ekleyin:
   - "Custom Domain" butonuna tıkla
   - Domain adınızı girin (örn: `beta.bilan-easy.com`)
   - DNS kayıtlarını Railway'in verdiği değerlere göre güncelleyin

### 7. Database Migration Çalıştır

PostgreSQL servisi hazır olduktan sonra, database migration'ı çalıştırın:

```bash
# Railway CLI kur (opsiyonel)
npm i -g @railway/cli

# Railway'e login ol
railway login

# Projeyi seç
railway link

# PostgreSQL'e bağlan ve migration çalıştır
railway run psql $DATABASE_URL -f migrations/add_question_fields_to_answers.sql
```

Veya Railway dashboard'dan PostgreSQL servisine bağlanıp SQL'i manuel olarak çalıştırabilirsiniz.

### 8. Deploy!

1. Railway dashboard'da "Deploy" butonuna tıkla
2. Railway otomatik olarak:
   - Docker image'ları build eder
   - Servisleri başlatır
   - Health check'leri çalıştırır
3. Deploy tamamlandığında URL'yi alın (örn: `https://bilan-final-full-production.up.railway.app`)

## 🔍 Deployment Kontrolü

### 1. Frontend Kontrolü
- URL'ye gidin: `https://your-app.railway.app`
- Ana sayfa yükleniyor mu?
- Console'da hata var mı?

### 2. Backend Kontrolü
- API endpoint'ini test edin: `https://your-app.railway.app/api/health`
- Response: `{"status":"ok"}` olmalı

### 3. Database Kontrolü
- Railway dashboard'da PostgreSQL servisine git
- "Data" sekmesinde tabloları kontrol et
- `assessments`, `answers`, `summaries` tabloları var mı?

## 🐛 Sorun Giderme

### Problem: Frontend yüklenmiyor
**Çözüm:**
- Railway dashboard'da frontend servisinin logs'larını kontrol et
- Environment variables doğru mu?
- `VITE_API_URL` backend URL'ini gösteriyor mu?

### Problem: Backend 500 hatası veriyor
**Çözüm:**
- Backend logs'larını kontrol et
- `DATABASE_URL` doğru mu?
- PostgreSQL servisi çalışıyor mu?

### Problem: Database bağlantı hatası
**Çözüm:**
- PostgreSQL servisinin `DATABASE_URL` environment variable'ını kontrol et
- Backend servisinde `DATABASE_URL` doğru mu?
- PostgreSQL servisi deploy edildi mi?

## 📊 Monitoring

Railway dashboard'da:
- **Metrics**: CPU, Memory, Network kullanımı
- **Logs**: Her servisin log'ları
- **Deployments**: Deploy geçmişi

## 💰 Maliyet

**Hobby Plan (Beta Test İçin):**
- $5/ay base
- + $0.000463/GB RAM saatlik
- + $0.000231/GB storage saatlik
- **Tahmini:** $5-20/ay (beta test için yeterli)

**Pro Plan (Production İçin):**
- $20/ay base
- Daha fazla kaynak
- **Tahmini:** $20-100/ay

## 🔄 Production'a Geçiş

Beta test başarılı olduktan sonra:

1. **Plan Upgrade**: Hobby → Pro plan'a geç
2. **Scaling**: Daha fazla RAM/CPU ekle
3. **Monitoring**: Advanced monitoring ekle
4. **Backup**: Otomatik backup ayarla
5. **Custom Domain**: Production domain ekle

## 📚 Ek Kaynaklar

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Pricing](https://railway.app/pricing)

## ✅ Checklist

- [ ] Railway hesabı oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Environment variables eklendi
- [ ] PostgreSQL servisi eklendi
- [ ] Database migration çalıştırıldı
- [ ] Frontend deploy edildi
- [ ] Backend deploy edildi
- [ ] Custom domain eklendi (opsiyonel)
- [ ] Test edildi
- [ ] Beta kullanıcılarına paylaşıldı

---

**Süre:** ~10-15 dakika  
**Zorluk:** ⭐⭐ (Kolay)  
**Maliyet:** $5-20/ay

