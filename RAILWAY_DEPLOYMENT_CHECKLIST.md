# ✅ Railway Deployment Checklist

## 🔐 Railway Bilgileri

- **Token**: `5af990b9-a904-4218-8730-bf60d558b923`
- **Project ID**: `0833d43b-02db-414d-a233-462aabfc0049`

## 📋 Deployment Checklist

### 1. Git Durumu ✅

- [x] Tüm değişiklikler commit edildi
- [x] Remote repository'ye push edildi
- [x] `nginx.conf` düzeltmesi push edildi
- [x] `RAILWAY_BUILD_VARS.md` eklendi
- [x] `RAILWAY_NGINX_FIX.md` eklendi

### 2. Railway Frontend Servisi

#### Environment Variables (Build-Time)

Frontend servisinde şu variables'lar olmalı:

- [ ] `VITE_GEMINI_API_KEY` - Gemini API key
- [ ] `VITE_OPENAI_API_KEY` - OpenAI API key (opsiyonel)
- [ ] `VITE_CLAUDE_API_KEY` - Claude API key (opsiyonel)
- [ ] `VITE_API_URL` - Backend servisinin Railway URL'i (örn: `https://backend-service.railway.app/api`)
- [ ] `VITE_GEMINI_MAX_CONCURRENCY` - `2` (opsiyonel)
- [ ] `VITE_GEMINI_FALLBACK_MODEL` - `gemini-1.5-flash` (opsiyonel)

#### Kontrol

1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesine gidin
3. Yukarıdaki variables'ların olduğundan emin olun
4. Build logs'da şunu görmelisiniz:
   ```
   ✅ VITE_GEMINI_API_KEY: SET (length: 39)
   ```

### 3. Railway Backend Servisi

#### Environment Variables

Backend servisinde şu variables'lar olmalı:

- [ ] `DATABASE_URL` - PostgreSQL connection string (Railway otomatik oluşturur)
- [ ] `FRONTEND_URL` - Frontend servisinin Railway URL'i (CORS için)
- [ ] `PORT` - `3001`
- [ ] `NODE_ENV` - `production`
- [ ] `TEST_MODE` - `false`
- [ ] `GEMINI_MAX_CONCURRENCY` - `2` (opsiyonel)
- [ ] `GEMINI_FALLBACK_MODEL` - `gemini-1.5-flash` (opsiyonel)

#### Kontrol

1. Railway dashboard'da backend servisine gidin
2. "Variables" sekmesine gidin
3. `DATABASE_URL` Railway PostgreSQL servisi tarafından otomatik oluşturulmalı
4. `FRONTEND_URL` frontend servisinin URL'ini göstermeli

### 4. Railway PostgreSQL Servisi

#### Kontrol

1. Railway dashboard'da PostgreSQL servisine gidin
2. "Variables" sekmesine gidin
3. `DATABASE_URL` değişkenini kontrol edin
4. Backend servisine `DATABASE_URL` bağlantısını kontrol edin

### 5. Service URLs

#### Frontend URL
- [ ] Frontend servisinin Railway URL'ini alın
- [ ] Örnek: `https://bilan-frontend-production.up.railway.app`

#### Backend URL
- [ ] Backend servisinin Railway URL'ini alın
- [ ] Örnek: `https://bilan-backend-production.up.railway.app`
- [ ] Frontend servisinde `VITE_API_URL` olarak ekleyin: `https://bilan-backend-production.up.railway.app/api`

### 6. Database Migration

- [ ] PostgreSQL servisi deploy edildi
- [ ] Database migration çalıştırıldı
- [ ] `assessments`, `answers`, `summaries` tabloları oluşturuldu

**Migration Komutu:**
```bash
# Railway CLI ile
railway run psql $DATABASE_URL -f migrations/add_question_fields_to_answers.sql

# Veya Railway dashboard'dan PostgreSQL servisine bağlanıp SQL'i manuel çalıştırın
```

### 7. Deployment Kontrolü

#### Frontend
- [ ] Build başarılı
- [ ] Nginx hatası yok
- [ ] Environment variables build-time'da set edildi
- [ ] Frontend URL'e erişilebiliyor

#### Backend
- [ ] Build başarılı
- [ ] Database bağlantısı başarılı
- [ ] Health check endpoint çalışıyor: `https://backend-url.railway.app/health`
- [ ] API endpoint'leri çalışıyor

#### Test
- [ ] Frontend URL'e gidildi
- [ ] Browser console'da hata yok
- [ ] API istekleri backend'e gidiyor
- [ ] CORS hatası yok

## 🔧 Yaygın Sorunlar ve Çözümleri

### Sorun 1: Build-time variables set edilmemiş

**Çözüm:**
1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesinde `VITE_GEMINI_API_KEY` olduğundan emin olun
3. Servisi redeploy edin

### Sorun 2: Nginx "backend host not found" hatası

**Çözüm:**
- ✅ `nginx.conf` dosyasından API proxy kaldırıldı
- Frontend artık `VITE_API_URL` kullanarak direkt backend'e istek yapacak

### Sorun 3: CORS hatası

**Çözüm:**
1. Backend servisinde `FRONTEND_URL` değişkenini kontrol edin
2. Frontend servisinin Railway URL'ini backend'e ekleyin
3. Backend'i redeploy edin

### Sorun 4: Database bağlantı hatası

**Çözüm:**
1. PostgreSQL servisinin `DATABASE_URL` değişkenini kontrol edin
2. Backend servisinde `DATABASE_URL` değişkenini kontrol edin
3. Railway'in otomatik bağlantısını kontrol edin

## 📊 Deployment Sonrası Test

### 1. Frontend Test
```bash
# Frontend URL'e gidin
curl https://your-frontend-url.railway.app

# Response: HTML içeriği dönmeli
```

### 2. Backend Health Check
```bash
# Backend health endpoint'ini test edin
curl https://your-backend-url.railway.app/health

# Response: {"status":"ok","timestamp":"...","environment":"production"}
```

### 3. API Test
```bash
# API endpoint'ini test edin
curl https://your-backend-url.railway.app/api/assessments

# Response: JSON response veya authentication error (normal)
```

### 4. Browser Test
1. Frontend URL'e gidin
2. Browser console'u açın (F12)
3. Network sekmesinde API isteklerini kontrol edin
4. Console'da hata olmamalı

## 🚀 Sonraki Adımlar

1. ✅ Git durumu kontrol edildi
2. ✅ Railway deployment checklist oluşturuldu
3. ⏳ Railway dashboard'da variables kontrol edilecek
4. ⏳ Servisler redeploy edilecek
5. ⏳ Test edilecek

## 📝 Notlar

- Railway token ve Project ID güvenli bir yerde saklanmalı
- Environment variables'lar Railway dashboard'da yönetilmeli
- Database migration'ları Railway CLI veya dashboard üzerinden çalıştırılmalı
- CORS ayarları backend'de `FRONTEND_URL` ile yapılandırılmalı

