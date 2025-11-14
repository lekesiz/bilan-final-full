# 🔧 Troubleshooting Guide

## Sorun: Boş Beyaz Sayfa (Frontend)

### Belirtiler
- `http://localhost:3000/` boş beyaz sayfa gösteriyor
- Asset'ler yükleniyor (200 OK)
- JavaScript hatası olabilir

### Olası Nedenler
1. **Backend'e bağlanamıyor**: `authProvider.check()` timeout oluyor
2. **JavaScript runtime hatası**: ErrorBoundary yakalıyor ama gösterilmiyor
3. **Lazy loading hatası**: Sayfa component'leri yüklenemiyor

### Çözüm Adımları

#### 1. Browser Console'u Kontrol Et
```bash
# Browser'da F12 tuşuna bas
# Console sekmesine git
# Kırmızı hata mesajlarını kontrol et
```

#### 2. Backend Health Check
```bash
curl http://localhost:3001/health
# Beklenen: {"status":"ok","timestamp":"...","environment":"production"}
```

#### 3. Network Tab'ı Kontrol Et
```bash
# Browser'da F12 > Network sekmesi
# Sayfayı yenile (F5)
# Kırmızı (failed) request'leri kontrol et
```

#### 4. Backend Loglarını Kontrol Et
```bash
docker-compose logs backend | tail -50
```

#### 5. Frontend Loglarını Kontrol Et
```bash
docker-compose logs frontend | tail -50
```

### Hızlı Çözüm
```bash
# Container'ları restart et
docker-compose restart frontend backend

# Veya tamamen yeniden başlat
docker-compose down
docker-compose up -d --build
```

---

## Sorun: Database "bilan_user" Does Not Exist

### Belirtiler
```
postgres | FATAL: database "bilan_user" does not exist
```

### Olası Nedenler
1. **Connection pool'da eski connection'lar**: Backend restart edilmedi
2. **Yanlış connection string**: Başka bir yerde yanlış database adı kullanılıyor
3. **PostgreSQL volume'u eski veriler içeriyor**: Volume temizlenmeli

### Çözüm Adımları

#### 1. DATABASE_URL Kontrolü
```bash
docker-compose exec backend printenv DATABASE_URL
# Beklenen: postgresql://bilan_user:bilan_password@postgres:5432/bilan_easy
```

#### 2. Database Var mı Kontrol Et
```bash
docker-compose exec postgres psql -U bilan_user -d bilan_easy -c "SELECT current_database();"
# Beklenen: bilan_easy
```

#### 3. Tüm Database'leri Listele
```bash
docker-compose exec postgres psql -U bilan_user -d postgres -c "\l"
# bilan_easy database'i görünmeli
```

#### 4. Connection Pool'u Temizle
```bash
# Backend'i restart et
docker-compose restart backend

# Veya tamamen yeniden başlat
docker-compose down
docker-compose up -d --build
```

#### 5. PostgreSQL Volume'u Temizle (Son Çare)
```bash
# ⚠️ DİKKAT: Bu işlem tüm database verilerini siler!
docker-compose down -v
docker-compose up -d --build
```

### Önleme
- `docker-compose.yml` içinde `DATABASE_URL` doğru tanımlanmalı
- `POSTGRES_DB` environment variable'ı `bilan_easy` olmalı
- Connection pool ayarları doğru yapılandırılmalı

---

## Sorun: Backend "/" Endpoint 404

### Belirtiler
```json
{"error":"Not found","path":"/"}
```

### Açıklama
Backend'in root endpoint'i (`/`) yok. Bu normaldir. Backend API endpoint'leri `/api/*` altında.

### Doğru Endpoint'ler
- Health check: `GET /health`
- API: `GET /api/*`

### Test
```bash
# Health check
curl http://localhost:3001/health

# API endpoint (örnek)
curl http://localhost:3001/api/users
```

---

## Genel Debugging

### 1. Tüm Container'ları Kontrol Et
```bash
docker-compose ps
# Tüm container'lar "Up" olmalı
```

### 2. Logları İzle
```bash
# Tüm loglar
docker-compose logs -f

# Sadece backend
docker-compose logs -f backend

# Sadece frontend
docker-compose logs -f frontend

# Sadece postgres
docker-compose logs -f postgres
```

### 3. Environment Variables Kontrolü
```bash
# Backend
docker-compose exec backend printenv | grep -E "DATABASE_URL|JWT_SECRET|PORT"

# Frontend
docker-compose exec frontend printenv | grep -E "VITE_"
```

### 4. Network Bağlantısı
```bash
# Backend'den postgres'e
docker-compose exec backend ping -c 3 postgres

# Frontend'den backend'e
docker-compose exec frontend ping -c 3 backend
```

---

## Hızlı Referans

### Container'ları Restart Et
```bash
docker-compose restart
```

### Container'ları Yeniden Build Et
```bash
docker-compose up -d --build
```

### Tüm Container'ları Durdur
```bash
docker-compose down
```

### Volume'ları da Sil (DİKKAT!)
```bash
docker-compose down -v
```

### Logları Temizle
```bash
docker-compose logs --tail=0 -f
```

---

---

## Sorun: Admin Kullanıcı Menüleri Göremiyor

### Belirtiler
- Admin kullanıcı (`admin@bilan.com`) login olabiliyor
- Ancak sidebar'da "Users", "Roles & Permissions" gibi menüler görünmüyor
- Dashboard'da "yetkilendirme sorunu" uyarıları görünüyor

### Olası Nedenler
1. **Permission cache sorunu**: Frontend'de eski permission'lar cache'lenmiş
2. **Database'de rol atanmamış**: Admin kullanıcısına `admin` rolü atanmamış
3. **Permission'lar eksik**: Admin rolüne tüm permission'lar atanmamış

### Çözüm Adımları

#### 1. Database'de Admin Rolünü Kontrol Et
```bash
docker-compose exec postgres psql -U bilan_user -d bilan_easy << 'EOF'
SELECT 
    u.email,
    r.name as role_name,
    COUNT(DISTINCT rp.permission_id) as permission_count
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE u.email = 'admin@bilan.com'
GROUP BY u.email, r.name;
EOF
```

**Beklenen Sonuç**:
- `role_name`: `admin`
- `permission_count`: `15` (tüm permission'lar)

#### 2. Admin Rolünü ve Permission'ları Ata
```bash
docker-compose exec postgres psql -U bilan_user -d bilan_easy << 'EOF'
-- Admin kullanıcısına admin rolünü ata
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@bilan.com';
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    -- Admin rolünü ata
    INSERT INTO user_roles (user_id, role_id)
    SELECT admin_user_id, admin_role_id
    WHERE NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = admin_user_id AND role_id = admin_role_id
    );
    
    -- Admin rolüne tüm permission'ları ata
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT admin_role_id, p.id
    FROM permissions p
    WHERE NOT EXISTS (
        SELECT 1 FROM role_permissions 
        WHERE role_id = admin_role_id AND permission_id = p.id
    );
END $$;
EOF
```

#### 3. Frontend Permission Cache'i Temizle
```bash
# Browser console'da (F12) şunu çalıştırın:
localStorage.removeItem('bilan_permissions');
localStorage.removeItem('bilan_auth_token');

# Sonra logout yapıp tekrar login yapın
```

#### 4. Frontend'i Rebuild Et (Gerekirse)
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Önleme
- Permission'lar her auth check'te backend'den yeniden yükleniyor (cache sorunu çözüldü)
- Admin kullanıcı seed script'i ile otomatik oluşturuluyor
- Database migration'ları otomatik çalışıyor

---

*Son güncelleme: 2025-11-14*

