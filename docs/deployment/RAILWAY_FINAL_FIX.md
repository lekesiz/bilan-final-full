# 🚂 Railway Deployment - Final Fix Guide

## 🎯 Mevcut Durum

Railway'de deployment yapıldı ancak şu sorunlar var:
1. ❌ Nginx "backend host not found" hatası (satır 31)
2. ❌ Build-time environment variables set edilmemiş

## 🔍 Sorun Analizi

### Sorun 1: Nginx Hatası
Railway hala eski `nginx.conf` dosyasını kullanıyor. Yeni versiyon (API proxy kaldırılmış) deploy edilmemiş.

**Çözüm:** Force redeploy + build cache temizleme

### Sorun 2: Build-Time Variables
`VITE_GEMINI_API_KEY` ve diğer API key'ler build-time'da set edilmemiş.

**Çözüm:** Railway dashboard'da variables kontrolü ve redeploy

## ✅ Adım Adım Çözüm

### 1. Railway Dashboard'da Frontend Servisi

#### A. Build Cache Temizleme

1. Railway dashboard'da frontend servisine gidin
2. "Settings" sekmesine gidin
3. "Build" bölümüne gidin
4. "Clear Build Cache" butonuna tıklayın (varsa)
5. Veya "Deployments" sekmesine gidin
6. En son deployment'a tıklayın
7. "Redeploy" butonuna tıklayın
8. **ÖNEMLİ:** "Clear build cache" seçeneğini işaretleyin (varsa)

#### B. Environment Variables Kontrolü

1. Frontend servisinde "Variables" sekmesine gidin
2. Şu variables'ların olduğundan emin olun:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here (opsiyonel)
   VITE_CLAUDE_API_KEY=your_claude_api_key_here (opsiyonel)
   VITE_API_URL=https://your-backend-service.railway.app/api
   ```

3. **ÖNEMLİ:** `VITE_API_URL` backend servisinin Railway URL'ini içermeli
   - Backend servisinin URL'ini alın (örn: `https://bilan-backend-production.up.railway.app`)
   - Frontend servisine `VITE_API_URL` olarak ekleyin: `https://bilan-backend-production.up.railway.app/api`

#### C. Redeploy

1. Variables ekledikten/güncelledikten sonra
2. "Deployments" sekmesine gidin
3. "Redeploy" butonuna tıklayın
4. Build logs'ları kontrol edin

### 2. Railway Dashboard'da Backend Servisi

#### A. Environment Variables Kontrolü

1. Backend servisinde "Variables" sekmesine gidin
2. Şu variables'ların olduğundan emin olun:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway otomatik oluşturur
   FRONTEND_URL=https://your-frontend-service.railway.app
   PORT=3001
   NODE_ENV=production
   TEST_MODE=false
   ```

3. **ÖNEMLİ:** `FRONTEND_URL` frontend servisinin Railway URL'ini içermeli (CORS için)

#### B. PostgreSQL Bağlantısı

1. PostgreSQL servisinin `DATABASE_URL` değişkenini kontrol edin
2. Backend servisinde `DATABASE_URL` değişkeninin PostgreSQL servisine bağlı olduğundan emin olun
3. Railway otomatik olarak `${{Postgres.DATABASE_URL}}` formatını kullanır

#### C. Redeploy

1. Variables kontrol edildikten sonra
2. "Deployments" sekmesine gidin
3. "Redeploy" butonuna tıklayın

### 3. Kontrol ve Test

#### Build Logs Kontrolü (Frontend)

Redeploy sonrası build logs'da şunu görmelisiniz:

```
✅ DOĞRU:
[frontend 3/3] COPY nginx.conf /etc/nginx/conf.d/default.conf
🔍 Build-time environment check:
  ✅ VITE_GEMINI_API_KEY: SET (length: 39)
  ✅ VITE_OPENAI_API_KEY: SET (length: 164)
  ✅ VITE_CLAUDE_API_KEY: SET (length: 108)
```

#### Runtime Logs Kontrolü (Frontend)

Redeploy sonrası runtime logs'da şunu görmelisiniz:

```
✅ DOĞRU:
Configuration complete; ready for start up
(backend hatası yok)

❌ YANLIŞ (Eski):
nginx: [emerg] host not found in upstream "backend"
```

#### Backend Health Check

```bash
curl https://your-backend-url.railway.app/health
# Response: {"status":"ok","timestamp":"...","environment":"production"}
```

#### Frontend Test

1. Frontend URL'e gidin: `https://your-frontend-url.railway.app`
2. Browser console'u açın (F12)
3. Network sekmesinde API isteklerini kontrol edin
4. API istekleri backend URL'ine gitmeli
5. CORS hatası olmamalı

## 🔧 Railway Token ve Project ID

- **Token**: `5af990b9-a904-4218-8730-bf60d558b923`
- **Project ID**: `0833d43b-02db-414d-a233-462aabfc0049`

## 📋 Checklist

### Frontend Servisi
- [ ] Build cache temizlendi
- [ ] `VITE_GEMINI_API_KEY` eklendi
- [ ] `VITE_API_URL` eklendi (backend URL + /api)
- [ ] Redeploy yapıldı
- [ ] Build logs'da nginx.conf kopyalandı
- [ ] Build logs'da API key'ler set edildi
- [ ] Runtime logs'da nginx hatası yok

### Backend Servisi
- [ ] `DATABASE_URL` PostgreSQL servisine bağlı
- [ ] `FRONTEND_URL` frontend URL'ini gösteriyor
- [ ] Redeploy yapıldı
- [ ] Health check çalışıyor
- [ ] Database bağlantısı başarılı

### PostgreSQL Servisi
- [ ] `DATABASE_URL` oluşturuldu
- [ ] Backend servisine bağlı
- [ ] Database migration çalıştırıldı (opsiyonel)

## 🐛 Sorun Giderme

### Problem: Hala nginx hatası görünüyor

**Çözüm:**
1. Railway dashboard'da frontend servisine gidin
2. "Deployments" sekmesine gidin
3. En son deployment'ın build logs'larını kontrol edin
4. `nginx.conf` dosyasının kopyalandığını görmelisiniz
5. Eğer görünmüyorsa, GitHub repository'nizdeki `nginx.conf` dosyasını kontrol edin
6. Force redeploy yapın

### Problem: Build-time variables hala set edilmemiş

**Çözüm:**
1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesine gidin
3. `VITE_` prefix'li değişkenlerin olduğundan emin olun
4. Değerlerin doğru olduğundan emin olun (tırnak işareti yok)
5. Redeploy yapın

### Problem: CORS hatası

**Çözüm:**
1. Backend servisinde `FRONTEND_URL` değişkenini kontrol edin
2. Frontend servisinin Railway URL'ini backend'e ekleyin
3. Backend'i redeploy edin

## 📝 Özet

✅ **Yapılması Gerekenler:**
1. Railway dashboard'da frontend servisine gidin
2. Build cache temizleyin veya force redeploy yapın
3. Environment variables'ları kontrol edin
4. `VITE_API_URL` backend URL'ini içermeli
5. Backend servisinde `FRONTEND_URL` frontend URL'ini içermeli
6. Her iki servisi de redeploy edin
7. Test edin

✅ **Beklenen Sonuç:**
- Frontend build başarılı
- Nginx hatası yok
- Build-time variables set edildi
- Backend health check çalışıyor
- Frontend backend'e bağlanabiliyor

---

**Not:** Railway bazen cache'i temizlemek için birkaç dakika beklemek gerekebilir. Eğer hala sorun devam ederse, Railway support'a başvurun.

