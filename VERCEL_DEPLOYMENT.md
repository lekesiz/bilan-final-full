# 🚀 Vercel Deployment Guide

## 📋 Vercel Proje Bilgileri

- **Token**: `b09cca59-51a0-4185-8b32-4452b0e39bf2`
- **Repository**: `https://github.com/lekesiz/bilan-final-full.git`

## 🎯 Deployment Stratejisi

Vercel'de frontend ve backend'i birlikte deploy edeceğiz:
- **Frontend**: Vite/React build → Vercel static hosting
- **Backend**: Hono.js → Vercel serverless functions (`/api`)

## 📁 Yapılandırma Dosyaları

### 1. `vercel.json`
Frontend ve API routing yapılandırması

### 2. `api/index.ts`
Backend API için Vercel serverless function handler

## 🔧 Adım Adım Deployment

### 1. Vercel CLI ile Login

```bash
vercel login
# Veya token ile:
vercel login --token b09cca59-51a0-4185-8b32-4452b0e39bf2
```

### 2. Projeyi Link Et

```bash
vercel link
# Veya token ile:
vercel link --token b09cca59-51a0-4185-8b32-4452b0e39bf2
```

### 3. Environment Variables Ekle

#### Frontend Variables (Build-Time)

```bash
vercel env add VITE_GEMINI_API_KEY production
vercel env add VITE_OPENAI_API_KEY production
vercel env add VITE_CLAUDE_API_KEY production
vercel env add VITE_API_URL production
```

#### Backend Variables (Runtime)

```bash
vercel env add DATABASE_URL production
vercel env add FRONTEND_URL production
vercel env add NODE_ENV production
vercel env add TEST_MODE production
```

### 4. Deploy

```bash
vercel --prod
```

## 🌐 Environment Variables

### Frontend (Build-Time)

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `VITE_GEMINI_API_KEY` | Gemini API key | `AIzaSy...` |
| `VITE_OPENAI_API_KEY` | OpenAI API key (opsiyonel) | `sk-...` |
| `VITE_CLAUDE_API_KEY` | Claude API key (opsiyonel) | `sk-ant-...` |
| `VITE_API_URL` | Backend API URL | `https://your-app.vercel.app/api` |

### Backend (Runtime)

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `FRONTEND_URL` | Frontend URL (CORS için) | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment | `production` |
| `TEST_MODE` | Test mode | `false` |

## 📊 Database (Supabase veya Railway PostgreSQL)

Vercel serverless functions için PostgreSQL database gerekli. İki seçenek:

### Seçenek 1: Supabase (Önerilen)

1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur
3. PostgreSQL connection string'i al
4. Vercel'e `DATABASE_URL` olarak ekle

### Seçenek 2: Railway PostgreSQL

1. Railway'de PostgreSQL servisi oluştur
2. Connection string'i al
3. Vercel'e `DATABASE_URL` olarak ekle

## 🔍 Kontrol

### 1. Frontend Test

```bash
curl https://your-app.vercel.app
# Response: HTML içeriği
```

### 2. Backend Health Check

```bash
curl https://your-app.vercel.app/api/health
# Response: {"status":"ok","timestamp":"...","environment":"production"}
```

### 3. API Test

```bash
curl https://your-app.vercel.app/api/assessments
# Response: JSON response veya authentication error (normal)
```

## 🐛 Sorun Giderme

### Problem: Build-time variables set edilmemiş

**Çözüm:**
- Vercel dashboard'da "Settings" > "Environment Variables"
- `VITE_` prefix'li değişkenlerin "Production" için set edildiğinden emin olun
- Redeploy edin

### Problem: API 404 hatası

**Çözüm:**
- `api/index.ts` dosyasının doğru export ettiğinden emin olun
- `vercel.json` dosyasında routing kontrol edin
- Vercel dashboard'da "Functions" sekmesinde API function görünüyor mu kontrol edin

### Problem: Database bağlantı hatası

**Çözüm:**
- `DATABASE_URL` environment variable'ını kontrol edin
- Database servisinin erişilebilir olduğundan emin olun
- Vercel serverless functions'ın database'e erişim izni olduğundan emin olun

## 📝 Notlar

- Vercel serverless functions için `nodejs20.x` runtime kullanılıyor
- API function için `maxDuration: 30` saniye ayarlandı
- Frontend build `dist/` klasörüne yapılıyor
- API routes `/api/*` pattern'i ile eşleşiyor

## ✅ Checklist

- [ ] Vercel CLI kurulu
- [ ] Vercel'e login olundu
- [ ] Proje link edildi
- [ ] Environment variables eklendi
- [ ] Database bağlantısı yapılandırıldı
- [ ] Deploy edildi
- [ ] Frontend test edildi
- [ ] Backend API test edildi

