# ✅ Deployment Checklist - BILAN-EASY

Bu checklist, BILAN-EASY projesini production'a deploy etmek için gereken tüm adımları içerir.

---

## 📋 Pre-Deployment Checklist

### 1. Code Review
- [ ] Tüm değişiklikler commit edildi
- [ ] Testler başarıyla geçti (`npm test`)
- [ ] Build başarıyla tamamlandı (`npm run build`)
- [ ] Code review yapıldı
- [ ] Linter hataları düzeltildi

### 2. Database Preparation
- [ ] Production database oluşturuldu
- [ ] Database backup alındı (eğer mevcut data varsa)
- [ ] Migration dosyaları hazır (`migrations/add_rbac_tables.sql`)
- [ ] Seed script hazır (`backend/src/scripts/seed.ts`)

### 3. Environment Variables
- [ ] Frontend environment variables hazır
- [ ] Backend environment variables hazır
- [ ] Secrets güvenli bir şekilde saklanıyor
- [ ] `.env.example` dosyası güncel

---

## 🔧 Environment Variables Setup

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api

# AI Provider Keys (optional - backend'den de kullanılabilir)
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key

# Feature Flags
VITE_ENABLE_SENTRY=false
VITE_SENTRY_DSN=your-sentry-dsn
```

### Backend Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# CORS
CORS_ORIGIN=https://yourdomain.com

# AI Provider Keys
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: Email Service (daha sonra)
RESEND_API_KEY=your-resend-api-key

# Optional: Error Tracking (daha sonra)
SENTRY_DSN=your-sentry-dsn
```

---

## 🗄️ Database Migration

### 1. Production Database'e Bağlan

```bash
# PostgreSQL connection string ile bağlan
psql $DATABASE_URL
```

### 2. Migration Çalıştır

```bash
# Migration dosyasını çalıştır
psql $DATABASE_URL < migrations/add_rbac_tables.sql
```

Veya backend container içinden:

```bash
docker exec -it bilan-backend sh
npm run db:push
```

### 3. Migration Kontrolü

```sql
-- Tabloların oluşturulduğunu kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'roles', 'permissions', 'user_roles', 'role_permissions');

-- Her tablo için kontrol
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM roles;
SELECT COUNT(*) FROM permissions;
```

---

## 🌱 Database Seeding

### 1. Seed Script Çalıştır

```bash
cd backend
npm run seed
```

Veya production'da:

```bash
# Environment variables ile
DATABASE_URL=$DATABASE_URL npm run seed
```

### 2. Seed Kontrolü

```sql
-- Admin kullanıcı kontrolü
SELECT * FROM users WHERE email = 'admin@bilan-easy.com';

-- Roller kontrolü
SELECT * FROM roles;

-- Permission'lar kontrolü
SELECT * FROM permissions;

-- Role-Permission ilişkileri
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;
```

### 3. Admin Kullanıcı Girişi

1. Dashboard'a gidin: `https://yourdomain.com`
2. **Login** sayfasından admin email ve şifre ile giriş yapın
3. Admin panel'e erişebildiğinizi doğrulayın

---

## 🚀 Backend Deployment

### Railway Deployment

1. **Railway'a Bağlan**
   - GitHub repo'yu Railway'a bağla
   - `backend/` klasörünü root olarak ayarla

2. **PostgreSQL Service Ekle**
   - Railway dashboard'dan PostgreSQL service ekle
   - `DATABASE_URL` environment variable otomatik oluşur

3. **Environment Variables Ayarla**
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   GEMINI_API_KEY=your-key
   ```

4. **Build & Deploy**
   - Railway otomatik olarak build ve deploy eder
   - Logs'u kontrol et

5. **Health Check**
   ```bash
   curl https://api.yourdomain.com/health
   ```

### Render Deployment

1. **Render'da Yeni Web Service Oluştur**
   - GitHub repo'yu bağla
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

2. **PostgreSQL Database Ekle**
   - Render dashboard'dan PostgreSQL database ekle
   - `DATABASE_URL` otomatik oluşur

3. **Environment Variables** (Railway ile aynı)

4. **Deploy**
   - Render otomatik deploy eder

---

## 🎨 Frontend Deployment

### Vercel Deployment

1. **Vercel'e Bağlan**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables Ayarla**
   - Vercel dashboard'dan:
     - `VITE_API_URL`: Backend URL
     - `VITE_GEMINI_API_KEY`: (optional)
     - `VITE_ENABLE_SENTRY`: `false` (şimdilik)

3. **Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Netlify'a Bağlan**
   - GitHub repo'yu Netlify'a bağla

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables** (Vercel ile aynı)

4. **Deploy**
   - Netlify otomatik deploy eder

---

## 🧪 Smoke Tests

### 1. Health Check

```bash
# Backend health
curl https://api.yourdomain.com/health

# Expected: {"status":"ok"}
```

### 2. Authentication Test

```bash
# Register
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234","name":"Test User"}'

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
```

### 3. Frontend Test

1. **Dashboard'a Git**
   - `https://yourdomain.com` açılmalı
   - Login sayfası görünmeli

2. **Register/Login**
   - Yeni kullanıcı kaydı yap
   - Login yap
   - Dashboard'a yönlendirilmeli

3. **Navigation Test**
   - Sidebar menüleri çalışmalı
   - Her sayfa yüklenmeli

4. **BILAN Module Test**
   - "Bilan de Compétences" menüsüne git
   - Yeni bilan başlat
   - Soruları cevapla
   - Export işlemleri çalışmalı

5. **Admin Panel Test**
   - Admin kullanıcı ile giriş yap
   - Users sayfasına git
   - Roles sayfasına git
   - Permission'ları kontrol et

### 4. API Endpoints Test

```bash
# Get users (admin)
curl -X GET https://api.yourdomain.com/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get roles
curl -X GET https://api.yourdomain.com/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl -X GET https://api.yourdomain.com/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Monitoring Setup

### 1. Error Tracking (Daha Sonra)

Sentry setup (şimdilik disabled):

```env
VITE_ENABLE_SENTRY=false
SENTRY_DSN=your-sentry-dsn
```

### 2. Logging

- Backend logs: Railway/Render dashboard'dan kontrol et
- Frontend errors: Browser console'dan kontrol et

### 3. Performance Monitoring

- Vercel Analytics (frontend)
- Railway Metrics (backend)

---

## 🔒 Security Checklist

- [ ] JWT_SECRET güçlü ve unique
- [ ] Database password güçlü
- [ ] CORS origin doğru ayarlanmış
- [ ] HTTPS aktif (production'da)
- [ ] Environment variables güvenli saklanıyor
- [ ] API keys sadece backend'de
- [ ] Rate limiting aktif (gelecekte)

---

## 📝 Post-Deployment

### 1. Documentation Update

- [ ] Production URL'leri dokümantasyona ekle
- [ ] Environment variables dokümantasyonu güncelle
- [ ] Deployment guide'ı güncelle

### 2. Team Communication

- [ ] Team'e production URL'i bildir
- [ ] Admin credentials paylaş (güvenli şekilde)
- [ ] Deployment notları paylaş

### 3. Monitoring

- [ ] İlk 24 saat log'ları takip et
- [ ] Error rate'i kontrol et
- [ ] Performance metriklerini kontrol et

---

## 🚨 Rollback Plan

Eğer bir sorun olursa:

1. **Backend Rollback**
   - Railway/Render dashboard'dan önceki deployment'a dön
   - Veya git revert yap ve redeploy

2. **Frontend Rollback**
   - Vercel/Netlify dashboard'dan önceki deployment'a dön

3. **Database Rollback**
   - Migration'ı geri al (eğer gerekirse)
   - Backup'tan restore et

---

## ✅ Go-Live Checklist

- [ ] Tüm smoke tests geçti
- [ ] Admin kullanıcı oluşturuldu ve test edildi
- [ ] Database migration başarılı
- [ ] Seed script çalıştı
- [ ] Backend health check OK
- [ ] Frontend yükleniyor
- [ ] Authentication çalışıyor
- [ ] BILAN module çalışıyor
- [ ] Admin panel çalışıyor
- [ ] Analytics çalışıyor
- [ ] Export işlemleri çalışıyor
- [ ] CORS ayarları doğru
- [ ] HTTPS aktif
- [ ] Environment variables doğru
- [ ] Documentation güncel

---

**Son Güncelleme:** 12 Kasım 2024

