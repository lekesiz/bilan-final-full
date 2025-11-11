# 🔧 Railway Build-Time Environment Variables Fix

## Problem

Build logs'da şu mesaj görülüyor:
```
🔍 Build-time environment check:
  ❌ VITE_GEMINI_API_KEY: NOT SET
  ⚠️  VITE_OPENAI_API_KEY: NOT SET
  ⚠️  VITE_CLAUDE_API_KEY: NOT SET
```

Build başarılı ama API key'ler build-time'da set edilmemiş. Bu, Vite build sırasında bu değişkenlerin kullanılamayacağı anlamına gelir.

## Neden?

Railway'de Docker build sırasında environment variables otomatik olarak ARG'lara geçirilmez. Railway'in build-time variables özelliğini kullanmak veya `railway.toml` dosyası ile build arguments tanımlamak gerekir.

## Çözüm 1: Railway Build Settings (Önerilen)

### Adım 1: Railway Dashboard'da Build Settings

1. Railway dashboard'da projenize gidin
2. Frontend servisine tıklayın
3. "Settings" sekmesine gidin
4. "Build" bölümüne gidin
5. "Build Command" ve "Build Arguments" ayarlarını kontrol edin

### Adım 2: Railway Variables'ı Build-Time'a Geçir

Railway'de environment variables'ları build-time'a geçirmek için:

1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesine gidin
3. Mevcut variables'ları kontrol edin:
   - `VITE_GEMINI_API_KEY`
   - `VITE_OPENAI_API_KEY`
   - `VITE_CLAUDE_API_KEY`

4. **Önemli:** Railway otomatik olarak `VITE_` prefix'li değişkenleri build-time'a geçirir, ancak Dockerfile'da ARG olarak tanımlanmaları gerekir.

### Adım 3: Dockerfile Kontrolü

`Dockerfile` dosyasında ARG'lar zaten tanımlı:
```dockerfile
ARG VITE_GEMINI_API_KEY
ARG VITE_OPENAI_API_KEY
ARG VITE_CLAUDE_API_KEY
```

Ancak Railway'de bu ARG'ları build-time'da geçirmek için `railway.toml` dosyası oluşturmak gerekebilir.

## Çözüm 2: railway.toml Dosyası (Alternatif)

Proje root'unda `railway.toml` dosyası oluşturun:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[build.args]
VITE_GEMINI_API_KEY = "${{VITE_GEMINI_API_KEY}}"
VITE_OPENAI_API_KEY = "${{VITE_OPENAI_API_KEY}}"
VITE_CLAUDE_API_KEY = "${{VITE_CLAUDE_API_KEY}}"
```

**Not:** Bu dosya Railway'in eski versiyonlarında çalışır. Yeni Railway'de genellikle gerekmez.

## Çözüm 3: Runtime Variables (Geçici Çözüm)

Eğer build-time variables çalışmazsa, runtime'da inject edebilirsiniz:

### 1. Nginx Config Güncellemesi

`nginx.conf` dosyasına environment variable injection ekleyin:

```nginx
server {
    listen 80;
    # ... diğer ayarlar ...
    
    location / {
        # Environment variables'ı HTML'e inject et
        sub_filter '</head>' '<script>window.__ENV__ = {VITE_GEMINI_API_KEY: "$VITE_GEMINI_API_KEY", VITE_OPENAI_API_KEY: "$VITE_OPENAI_API_KEY", VITE_CLAUDE_API_KEY: "$VITE_CLAUDE_API_KEY"};</script></head>';
        sub_filter_once on;
        try_files $uri $uri/ /index.html;
    }
}
```

Ancak bu çözüm güvenlik açısından ideal değildir çünkü API key'ler client-side'da expose olur.

## Çözüm 4: Railway Service Variables (En İyi)

Railway'de en iyi çözüm, variables'ları doğru şekilde tanımlamak:

### Frontend Servisi İçin:

1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesine gidin
3. Şu variables'ları ekleyin (eğer yoksa):
   ```
   VITE_GEMINI_API_KEY=your_key_here
   VITE_OPENAI_API_KEY=your_key_here
   VITE_CLAUDE_API_KEY=your_key_here
   ```

4. **Önemli:** Railway'de `VITE_` prefix'li değişkenler otomatik olarak build-time'a geçirilir, ancak Dockerfile'da ARG olarak tanımlanmaları gerekir.

5. **Redeploy:** Variables ekledikten sonra servisi yeniden deploy edin.

### Dockerfile Kontrolü

`Dockerfile` dosyasında ARG'lar zaten var:
```dockerfile
ARG VITE_GEMINI_API_KEY
ARG VITE_OPENAI_API_KEY
ARG VITE_CLAUDE_API_KEY
```

Ancak Railway'de bu ARG'ları build-time'da geçirmek için Railway'in build settings'inde özel bir yapılandırma gerekebilir.

## Çözüm 5: Railway CLI ile Build (Gelişmiş)

Railway CLI kullanarak build arguments geçirebilirsiniz:

```bash
# Railway CLI kur
npm i -g @railway/cli

# Login
railway login

# Projeyi link et
railway link

# Build arguments ile deploy
railway up --build-arg VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
```

Ancak bu çözüm CLI kullanımı gerektirir.

## Önerilen Çözüm: Railway Dashboard'da Variables Kontrolü

1. **Railway Dashboard'a gidin**
2. **Frontend servisine tıklayın**
3. **"Variables" sekmesine gidin**
4. **Şu variables'ların olduğundan emin olun:**
   - `VITE_GEMINI_API_KEY`
   - `VITE_OPENAI_API_KEY` (opsiyonel)
   - `VITE_CLAUDE_API_KEY` (opsiyonel)

5. **Eğer yoksa ekleyin:**
   - "New Variable" butonuna tıklayın
   - Key: `VITE_GEMINI_API_KEY`
   - Value: API key'inizi girin
   - "Add" butonuna tıklayın

6. **Redeploy:**
   - "Deployments" sekmesine gidin
   - "Redeploy" butonuna tıklayın

7. **Build logs'ları kontrol edin:**
   - Build logs'da şunu görmelisiniz:
     ```
     ✅ VITE_GEMINI_API_KEY: SET (length: 39)
     ```

## Railway'de Build-Time Variables Nasıl Çalışır?

Railway'de:
- `VITE_` prefix'li değişkenler **otomatik olarak** build-time'a geçirilir
- Ancak Dockerfile'da `ARG` olarak tanımlanmaları gerekir
- Railway build sırasında bu ARG'ları Docker'a geçirir

## Kontrol Listesi

- [ ] Railway dashboard'da frontend servisine gittiniz mi?
- [ ] "Variables" sekmesinde `VITE_GEMINI_API_KEY` var mı?
- [ ] Variable'ın değeri doğru mu? (tırnak işareti yok mu?)
- [ ] Servisi redeploy ettiniz mi?
- [ ] Build logs'da `✅ VITE_GEMINI_API_KEY: SET` görünüyor mu?

## Sorun Devam Ederse

Eğer hala build-time variables set edilmiyorsa:

1. **Railway Support'a başvurun:** Railway'in build-time variables desteği hakkında
2. **Alternatif:** Runtime'da environment variables kullanın (güvenlik açısından ideal değil)
3. **Alternatif:** Backend'den API key'leri proxy edin (daha güvenli)

## Özet

✅ **Yapılması Gerekenler:**
1. Railway dashboard'da frontend servisine gidin
2. "Variables" sekmesinde `VITE_GEMINI_API_KEY` olduğundan emin olun
3. Servisi redeploy edin
4. Build logs'ları kontrol edin

✅ **Beklenen Sonuç:**
```
🔍 Build-time environment check:
  ✅ VITE_GEMINI_API_KEY: SET (length: 39)
  ✅ VITE_OPENAI_API_KEY: SET (length: 164)
  ✅ VITE_CLAUDE_API_KEY: SET (length: 108)
```

---

**Not:** Railway'de `VITE_` prefix'li değişkenler otomatik olarak build-time'a geçirilir, ancak bazen redeploy gerekebilir.

