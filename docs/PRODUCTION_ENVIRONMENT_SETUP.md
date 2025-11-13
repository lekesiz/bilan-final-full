# 🔧 Production Environment Setup

Bu dokümantasyon, BILAN-EASY projesi için production environment variables'ları ve setup adımlarını içerir.

---

## 📋 Environment Variables Overview

### Frontend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | ✅ Yes | `https://api.yourdomain.com/api` |
| `VITE_GEMINI_API_KEY` | Gemini API key | ❌ No | `AIza...` |
| `VITE_ENABLE_SENTRY` | Enable Sentry | ❌ No | `false` |
| `VITE_SENTRY_DSN` | Sentry DSN | ❌ No | `https://...` |

### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | `postgresql://...` |
| `JWT_SECRET` | JWT signing secret | ✅ Yes | `min-32-chars` |
| `JWT_EXPIRES_IN` | JWT expiration | ❌ No | `7d` |
| `PORT` | Server port | ❌ No | `3001` |
| `NODE_ENV` | Node environment | ✅ Yes | `production` |
| `FRONTEND_URL` | Frontend URL | ✅ Yes | `https://yourdomain.com` |
| `CORS_ORIGIN` | CORS allowed origin | ✅ Yes | `https://yourdomain.com` |
| `GEMINI_API_KEY` | Gemini API key | ✅ Yes | `AIza...` |
| `OPENAI_API_KEY` | OpenAI API key | ❌ No | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | ❌ No | `sk-ant-...` |

---

## 🔐 Security Best Practices

### 1. JWT_SECRET

- **Minimum 32 karakter** olmalı
- **Random ve unique** olmalı
- **Production'da asla commit edilmemeli**

```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

### 2. Database Password

- **Güçlü password** kullanın (min 16 karakter)
- **Unique** olmalı
- **Environment variable** olarak saklayın

### 3. API Keys

- **Sadece backend'de** saklayın (frontend'de gerekirse)
- **Rotate** edin düzenli olarak
- **Rate limiting** uygulayın

---

## 🚀 Deployment Platforms

### Railway

1. **Environment Variables Ekle**
   - Railway dashboard → Project → Variables
   - Her variable'ı ekle

2. **PostgreSQL Service**
   - PostgreSQL service ekle
   - `DATABASE_URL` otomatik oluşur

3. **Deploy**
   - Railway otomatik deploy eder

### Render

1. **Environment Variables Ekle**
   - Render dashboard → Service → Environment
   - Her variable'ı ekle

2. **PostgreSQL Database**
   - PostgreSQL database ekle
   - `DATABASE_URL` otomatik oluşur

3. **Deploy**
   - Render otomatik deploy eder

### Vercel (Frontend)

1. **Environment Variables Ekle**
   - Vercel dashboard → Project → Settings → Environment Variables
   - Her variable'ı ekle (VITE_ prefix ile)

2. **Deploy**
   - Git push → otomatik deploy

---

## 📝 Setup Checklist

### Pre-Deployment

- [ ] Tüm environment variables hazır
- [ ] JWT_SECRET generate edildi
- [ ] Database oluşturuldu
- [ ] API keys hazır
- [ ] CORS origin doğru ayarlandı

### Deployment

- [ ] Backend environment variables ayarlandı
- [ ] Frontend environment variables ayarlandı
- [ ] Database migration çalıştırıldı
- [ ] Seed script çalıştırıldı
- [ ] Health check başarılı

### Post-Deployment

- [ ] Login test edildi
- [ ] API endpoints test edildi
- [ ] CORS çalışıyor
- [ ] HTTPS aktif
- [ ] Error handling çalışıyor

---

## 🔍 Verification

### Backend Health Check

```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok"}
```

### Frontend Check

1. Browser'da `https://yourdomain.com` aç
2. Login sayfası görünmeli
3. Console'da hata olmamalı

### Database Check

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Check users
SELECT COUNT(*) FROM users;

# Check roles
SELECT COUNT(*) FROM roles;
```

---

## 🚨 Troubleshooting

### Environment Variable Not Found

- Variable'ın doğru isimde olduğundan emin ol
- Frontend: `VITE_` prefix gerekli
- Backend: Prefix yok
- Platform'da variable'ın set edildiğini kontrol et

### Database Connection Error

- `DATABASE_URL` formatını kontrol et
- Database'in erişilebilir olduğundan emin ol
- Firewall rules'u kontrol et

### CORS Error

- `CORS_ORIGIN` frontend URL'i ile eşleşmeli
- Wildcard (`*`) kullanma production'da
- HTTPS kullan

---

**Son Güncelleme:** 12 Kasım 2024

