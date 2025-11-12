# 🔧 Railway Nginx Fix - Backend Host Not Found

## Problem

Railway deploy log'larında şu hata görülüyor:
```
nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:31
```

## Neden?

Railway'de Docker Compose kullanırken, servisler ayrı ayrı deploy edilir. Docker Compose'daki service name'ler (örneğin `backend`) DNS'te çözümlenemez çünkü her servis ayrı bir container olarak çalışır.

`nginx.conf` dosyasında `proxy_pass http://backend:3001;` kullanılıyor, ancak Railway'de `backend` host'u bulunamıyor.

## Çözüm

Railway'de frontend ve backend ayrı servisler olarak deploy edilir ve her birinin kendi public URL'i vardır. Nginx proxy'ye gerek yok - frontend direkt backend'in public URL'ine istek yapabilir.

### 1. Nginx Proxy'yi Kaldır

`nginx.conf` dosyasından API proxy bölümünü kaldırdık. Frontend artık `VITE_API_URL` environment variable'ını kullanarak direkt backend'e istek yapacak.

### 2. Railway'de Environment Variables Ayarla

#### Frontend Servisi İçin:
```bash
VITE_API_URL=https://your-backend-service.railway.app/api
```

**Önemli:** Backend servisinin Railway URL'ini alın ve frontend servisine `VITE_API_URL` olarak ekleyin.

#### Backend Servisi İçin:
```bash
FRONTEND_URL=https://your-frontend-service.railway.app
```

**Önemli:** Frontend servisinin Railway URL'ini alın ve backend servisine `FRONTEND_URL` olarak ekleyin (CORS için).

### 3. CORS Ayarları

Backend'de CORS ayarlarının doğru olduğundan emin olun. `backend/src/app.ts` dosyasında:

```typescript
app.use('/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

## Adım Adım Çözüm

### 1. Railway'de Backend URL'ini Bul

1. Railway dashboard'da backend servisine gidin
2. "Settings" > "Networking" sekmesine gidin
3. "Generate Domain" butonuna tıklayın (veya mevcut domain'i kopyalayın)
4. Backend URL'ini kopyalayın: `https://your-backend-service.railway.app`

### 2. Frontend Servisine VITE_API_URL Ekleyin

1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesine gidin
3. "New Variable" butonuna tıklayın
4. Key: `VITE_API_URL`
5. Value: `https://your-backend-service.railway.app/api` (yukarıdaki URL + `/api`)
6. "Add" butonuna tıklayın

### 3. Backend Servisine FRONTEND_URL Ekleyin

1. Railway dashboard'da backend servisine gidin
2. "Variables" sekmesine gidin
3. "New Variable" butonuna tıklayın
4. Key: `FRONTEND_URL`
5. Value: `https://your-frontend-service.railway.app` (frontend URL'i)
6. "Add" butonuna tıklayın

### 4. Redeploy

1. Her iki servisi de yeniden deploy edin
2. Frontend servisinde "Redeploy" butonuna tıklayın
3. Backend servisinde "Redeploy" butonuna tıklayın

## Kontrol

Deploy sonrası:

1. **Frontend Logs Kontrolü:**
   - Frontend servisinin logs'larını kontrol edin
   - Nginx hatası görünmemeli
   - Frontend başarıyla başlamalı

2. **Backend Logs Kontrolü:**
   - Backend servisinin logs'larını kontrol edin
   - Backend başarıyla başlamalı
   - Database bağlantısı başarılı olmalı

3. **Browser Console Kontrolü:**
   - Frontend URL'ine gidin
   - Browser console'u açın
   - API istekleri backend URL'ine gidiyor mu kontrol edin
   - CORS hatası var mı kontrol edin

## Alternatif Çözüm (Eğer Hala Sorun Varsa)

Eğer hala sorun yaşıyorsanız, Railway'in internal service discovery'ini kullanabilirsiniz:

1. Railway dashboard'da backend servisine gidin
2. "Settings" > "Networking" sekmesine gidin
3. "Private Networking" özelliğini aktif edin
4. Internal hostname'i alın (örn: `backend.railway.internal`)
5. `nginx.conf` dosyasını güncelleyin:
   ```nginx
   location /api {
       proxy_pass http://backend.railway.internal:3001;
       # ...
   }
   ```

Ancak bu çözüm daha kompleks ve genellikle gerekli değildir. İlk çözüm (direkt backend URL kullanımı) daha basit ve önerilendir.

## Özet

✅ **Yapılan:**
- `nginx.conf` dosyasından API proxy kaldırıldı
- Frontend artık `VITE_API_URL` kullanarak direkt backend'e istek yapacak

✅ **Yapılması Gerekenler:**
- Railway'de backend URL'ini alın
- Frontend servisine `VITE_API_URL` ekleyin
- Backend servisine `FRONTEND_URL` ekleyin (CORS için)
- Her iki servisi de redeploy edin

---

**Not:** Bu değişiklik Railway için yapıldı. Local Docker Compose ortamında hala `backend` host'u çalışır çünkü orada servisler aynı network'te çalışır.

