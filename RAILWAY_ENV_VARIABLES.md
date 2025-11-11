# 🔐 Railway Environment Variables Guide

Bu dokümantasyon, Railway'de environment variables'ların nasıl doğru şekilde tanımlanacağını açıklar.

## ✅ Doğru Format

Railway'de environment variables tanımlarken **tam olarak** şu şekilde tanımlamalısınız:

### Frontend Servisi İçin

Railway dashboard'da **frontend servisine** şu değişkenleri ekleyin:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_CLAUDE_API_KEY=your_claude_api_key_here
VITE_GEMINI_MAX_CONCURRENCY=2
VITE_GEMINI_FALLBACK_MODEL=gemini-1.5-flash
VITE_API_URL=https://your-backend-service.railway.app/api
```

**Önemli:** 
- ✅ `VITE_` prefix'i **mutlaka** olmalı (Vite build time'da bunları kullanır)
- ✅ Değerlerde tırnak işareti **kullanmayın** (Railway otomatik olarak string olarak alır)
- ✅ Boşluk olmamalı `=` işaretinin etrafında

### Backend Servisi İçin

Railway dashboard'da **backend servisine** şu değişkenleri ekleyin:

```bash
DATABASE_URL=postgresql://bilan_user:password@postgres:5432/bilan_easy
POSTGRES_USER=bilan_user
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=bilan_easy
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-service.railway.app
TEST_MODE=false
GEMINI_MAX_CONCURRENCY=2
GEMINI_FALLBACK_MODEL=gemini-1.5-flash
```

**Not:** `DATABASE_URL` genellikle Railway PostgreSQL servisi tarafından otomatik oluşturulur. PostgreSQL servisinin "Variables" sekmesinde `DATABASE_URL` değişkenini bulup, backend servisine bağlayabilirsiniz.

## 🎯 Railway'de Nasıl Eklenir?

### Yöntem 1: Her Servis İçin Ayrı Ayrı (Önerilen)

1. Railway dashboard'da projenize gidin
2. **Frontend servisine** tıklayın
3. "Variables" sekmesine gidin
4. "New Variable" butonuna tıklayın
5. Şu değişkenleri ekleyin:
   ```
   Key: VITE_GEMINI_API_KEY
   Value: AIzaSy... (API key'iniz)
   ```
6. Aynı şekilde diğer `VITE_` prefix'li değişkenleri ekleyin

7. **Backend servisine** tıklayın
8. "Variables" sekmesine gidin
9. Backend için gerekli değişkenleri ekleyin

### Yöntem 2: Project-Level Variables (Tüm Servisler İçin)

1. Railway dashboard'da projenize gidin
2. "Variables" sekmesine gidin (proje seviyesinde)
3. "New Variable" butonuna tıklayın
4. Değişkenleri ekleyin

**Not:** Project-level variables tüm servislere otomatik olarak geçer. Ancak servis-specific variables daha kontrollü bir yaklaşımdır.

## ⚠️ Yaygın Hatalar

### ❌ Yanlış Formatlar

```bash
# ❌ YANLIŞ: Tırnak işareti kullanmayın
VITE_GEMINI_API_KEY="AIzaSy..."

# ❌ YANLIŞ: Boşluk kullanmayın
VITE_GEMINI_API_KEY = AIzaSy...

# ❌ YANLIŞ: Prefix eksik (frontend için)
GEMINI_API_KEY=AIzaSy...  # Bu backend için kullanılır, frontend için VITE_ prefix gerekli

# ❌ YANLIŞ: Büyük/küçük harf hatası
vite_gemini_api_key=AIzaSy...  # Küçük harf kullanmayın
```

### ✅ Doğru Formatlar

```bash
# ✅ DOĞRU: Frontend için
VITE_GEMINI_API_KEY=AIzaSy...

# ✅ DOĞRU: Backend için (VITE_ prefix yok)
GEMINI_API_KEY=AIzaSy...  # Backend için opsiyonel, genelde frontend'den kullanılmaz

# ✅ DOĞRU: Tırnak yok, boşluk yok
VITE_OPENAI_API_KEY=sk-...
```

## 🔍 Kontrol Listesi

Railway'de environment variables ekledikten sonra:

- [ ] Frontend servisinde `VITE_GEMINI_API_KEY` var mı?
- [ ] Frontend servisinde `VITE_OPENAI_API_KEY` var mı? (opsiyonel)
- [ ] Frontend servisinde `VITE_CLAUDE_API_KEY` var mı? (opsiyonel)
- [ ] Frontend servisinde `VITE_API_URL` backend URL'ini gösteriyor mu?
- [ ] Backend servisinde `DATABASE_URL` var mı?
- [ ] Backend servisinde `FRONTEND_URL` frontend URL'ini gösteriyor mu?
- [ ] PostgreSQL servisinde `DATABASE_URL` oluşturuldu mu?

## 🧪 Test Etme

Environment variables'ları ekledikten sonra:

1. **Frontend Build Logs Kontrolü:**
   - Railway dashboard'da frontend servisine gidin
   - "Deployments" sekmesine gidin
   - Son deployment'ın logs'larını kontrol edin
   - Şu mesajları görmelisiniz:
     ```
     ✅ VITE_GEMINI_API_KEY: SET (length: 39)
     ✅ VITE_OPENAI_API_KEY: SET (length: 164)
     ```

2. **Backend Runtime Kontrolü:**
   - Backend servisinin logs'larını kontrol edin
   - Database bağlantısı başarılı mı?
   - API endpoint'leri çalışıyor mu?

3. **Frontend Runtime Kontrolü:**
   - Browser console'u açın
   - Şu log'u görmelisiniz:
     ```
     🔍 AI Provider Environment Check: {hasGemini: true, hasOpenAI: true, hasClaude: true}
     ```

## 📋 Örnek Railway Variables Yapılandırması

### Frontend Servisi Variables

```
VITE_GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567890
VITE_OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz1234567890
VITE_CLAUDE_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890
VITE_GEMINI_MAX_CONCURRENCY=2
VITE_GEMINI_FALLBACK_MODEL=gemini-1.5-flash
VITE_API_URL=https://bilan-backend-production.up.railway.app/api
```

### Backend Servisi Variables

```
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway otomatik değişken
POSTGRES_USER=bilan_user
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=bilan_easy
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://bilan-frontend-production.up.railway.app
TEST_MODE=false
GEMINI_MAX_CONCURRENCY=2
GEMINI_FALLBACK_MODEL=gemini-1.5-flash
```

**Not:** `${{Postgres.DATABASE_URL}}` Railway'in otomatik oluşturduğu değişkendir. PostgreSQL servisinin adı `Postgres` ise bu şekilde kullanabilirsiniz.

## 🚀 Sonraki Adımlar

1. ✅ Environment variables'ları eklediniz
2. ✅ Deploy butonuna tıklayın
3. ✅ Build logs'larını kontrol edin
4. ✅ Application'ı test edin
5. ✅ Browser console'da AI provider kontrolü yapın

## 🐛 Sorun Giderme

### Problem: Frontend'de "API key missing" hatası

**Çözüm:**
- Railway dashboard'da frontend servisinin "Variables" sekmesini kontrol edin
- `VITE_` prefix'li değişkenler var mı?
- Değerler doğru mu? (tırnak işareti yok mu?)
- Deploy sonrası build logs'larını kontrol edin

### Problem: Backend'de database bağlantı hatası

**Çözüm:**
- PostgreSQL servisinin `DATABASE_URL` değişkenini kontrol edin
- Backend servisinde `DATABASE_URL` değişkeni var mı?
- `${{Postgres.DATABASE_URL}}` formatını kullanıyorsanız, PostgreSQL servisinin adını kontrol edin

### Problem: CORS hatası

**Çözüm:**
- Backend servisinde `FRONTEND_URL` değişkenini kontrol edin
- Frontend URL'i doğru mu? (https:// ile başlamalı)
- Backend'de CORS ayarlarını kontrol edin

---

**Özet:** Railway'de environment variables tanımlarken, `VITE_` prefix'li değişkenleri frontend servisine, diğer değişkenleri backend servisine ekleyin. Tırnak işareti kullanmayın, boşluk bırakmayın.

