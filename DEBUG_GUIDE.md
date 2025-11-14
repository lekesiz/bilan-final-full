# 🔍 Debug Guide - Boş Beyaz Sayfa Sorunu

## 📋 Durum

- ✅ PostgreSQL: Çalışıyor, hata yok
- ✅ Backend: Health check başarılı (200 OK)
- ✅ Frontend: Asset'ler yükleniyor (200 OK)
- ❌ Frontend: Boş beyaz sayfa görünüyor

## 🔧 Yapılan İyileştirmeler

### 1. Debug Logging Eklendi

Tüm kritik noktalara console.log eklendi:

- **AppWrapper**: App initialization
- **RefineApp**: Provider initialization  
- **AuthProvider.check**: Auth check adımları
- **API Client**: Tüm request/response'lar
- **ErrorBoundary**: Detaylı hata bilgileri

### 2. Hata Yakalama İyileştirildi

- ErrorBoundary daha detaylı log'lar gösteriyor
- API hataları daha iyi yakalanıyor
- Network timeout'lar daha iyi handle ediliyor

## 🚀 Debug Adımları

### 1. Frontend'i Rebuild Et

```bash
docker-compose up -d --build frontend
```

### 2. Browser Console'u Aç

1. Sayfayı aç: `http://localhost:3000/`
2. F12 tuşuna bas (Developer Tools)
3. Console sekmesine git
4. Sayfayı yenile (F5)

### 3. Log'ları Kontrol Et

Beklenen log sırası:

```
[AppWrapper] Initializing...
[AppWrapper] API initialized: OK
[AppWrapper] API URL: http://localhost:3001/api
[RefineApp] Initializing...
[RefineApp] Creating authProvider...
[RefineApp] Creating dataProvider...
[RefineApp] All providers initialized, rendering...
[AuthProvider.check] Starting auth check...
[AuthProvider.check] No token found, redirecting to login
```

VEYA (token varsa):

```
[AuthProvider.check] Token found, validating with backend...
[API] GET http://localhost:3001/api/auth/me
[API] Request headers: ['Authorization', 'Content-Type', ...]
[API] Response status: 200 OK
[API] Response data: { id: '...', email: '...', ... }
[AuthProvider.check] User validation result: SUCCESS
[AuthProvider.check] User authenticated: ...
```

### 4. Hata Durumunda

Eğer hata varsa, console'da şunları göreceksiniz:

```
❌ ErrorBoundary caught an error: ...
Error details: ...
Error stack: ...
```

VEYA

```
[API] Request error: Failed to fetch
[AuthProvider.check] Error: Failed to fetch
[AuthProvider.check] Backend not available, redirecting to login (keeping token)
```

## 🔍 Olası Sorunlar ve Çözümler

### Sorun 1: "[AppWrapper] Initializing..." görünmüyor

**Neden**: JavaScript hiç çalışmıyor
**Çözüm**: 
- Browser console'da syntax error var mı kontrol et
- Network tab'da JavaScript dosyaları yükleniyor mu kontrol et

### Sorun 2: "[AuthProvider.check] Starting auth check..." görünmüyor

**Neden**: RefineApp render edilmiyor
**Çözüm**:
- ErrorBoundary hata yakalıyor olabilir
- Browser console'da React error var mı kontrol et

### Sorun 3: "[API] GET ..." görünmüyor

**Neden**: authProvider.check() çağrılmıyor
**Çözüm**:
- Refine component'i düzgün mount olmuyor olabilir
- Browser console'da React warning var mı kontrol et

### Sorun 4: "[API] Request error: Failed to fetch"

**Neden**: Backend'e erişilemiyor
**Çözüm**:
```bash
# Backend çalışıyor mu?
curl http://localhost:3001/health

# CORS hatası var mı?
# Browser console'da CORS error var mı kontrol et
```

### Sorun 5: "[API] Response status: 401 Unauthorized"

**Neden**: Token geçersiz veya expire olmuş
**Çözüm**:
- localStorage'dan token'ı temizle
- Tekrar login yap

## 📊 Network Tab Kontrolü

1. Browser'da F12 > Network sekmesi
2. Sayfayı yenile (F5)
3. Şunları kontrol et:
   - `/auth/me` request'i var mı?
   - Status code nedir? (200, 401, 500?)
   - Response body nedir?
   - CORS error var mı?

## 🎯 Hızlı Test

```bash
# 1. Backend health check
curl http://localhost:3001/health

# 2. Backend API test (token olmadan)
curl http://localhost:3001/api/auth/me

# 3. Frontend HTML
curl http://localhost:3000/ | head -20

# 4. Frontend JavaScript
curl http://localhost:3000/assets/index-*.js | head -5
```

## 📝 Log Örnekleri

### Başarılı Senaryo

```
[AppWrapper] Initializing...
[AppWrapper] API initialized: OK
[AppWrapper] API URL: http://localhost:3001/api
[RefineApp] Initializing...
[RefineApp] Creating authProvider...
[RefineApp] Creating dataProvider...
[RefineApp] All providers initialized, rendering...
[AuthProvider.check] Starting auth check...
[AuthProvider.check] No token found, redirecting to login
```

### Hata Senaryosu

```
[AppWrapper] Initializing...
[AppWrapper] API initialized: OK
[RefineApp] Initializing...
❌ ErrorBoundary caught an error: TypeError: Cannot read property 'map' of undefined
Error stack: ...
```

## 🔧 Sonraki Adımlar

1. Browser console log'larını paylaş
2. Network tab'da failed request'leri kontrol et
3. Hangi adımda takıldığını belirle
4. O adıma özel çözüm uygula

---

*Son güncelleme: 2025-11-14*

