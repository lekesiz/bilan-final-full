# 📋 Dashboard Entegrasyon Çalışma Planı

**Proje:** BILAN-EASY Dashboard Entegrasyonu  
**Yaklaşım:** Refine.dev Framework + Custom BILAN Module  
**Süre:** 4 Hafta (20 iş günü)  
**Başlangıç Tarihi:** 12 Kasım 2024  
**Hedef Bitiş:** 10 Aralık 2024

---

## 🎯 Genel Bakış

### Hedef
Mevcut BILAN-EASY uygulamasını profesyonel bir dashboard içine modüler olarak entegre etmek, gelişmiş kullanıcı yönetimi ve detaylı yetkilendirme sistemi eklemek.

### Teknoloji Stack
- **Frontend Dashboard:** Refine.dev + React 19 + TypeScript
- **Backend:** Mevcut Hono.js API (genişletilecek)
- **Database:** PostgreSQL (schema genişletilecek)
- **Auth:** Custom RBAC system

---

## 📅 Haftalık Plan

### 🔵 HAFTA 1: Foundation & Setup (5 gün)

#### Gün 1: Refine Setup & Project Structure
**Süre:** 1 gün  
**Görevler:**
- [ ] Yeni dashboard projesi oluştur
  ```bash
  npm create refine-app@latest dashboard
  cd dashboard
  ```
- [ ] Refine configuration
- [ ] Project structure oluştur
  ```
  dashboard/
  ├── src/
  │   ├── core/
  │   ├── modules/
  │   ├── shared/
  │   └── App.tsx
  ```
- [ ] TypeScript configuration
- [ ] ESLint/Prettier setup
- [ ] Git repository setup (yeni repo veya mevcut repo'da branch)

**Deliverable:** Çalışan Refine dashboard (boş)

---

#### Gün 2: Database Schema Genişletme
**Süre:** 1 gün  
**Görevler:**
- [ ] Migration dosyası oluştur: `migrations/add_rbac_tables.sql`
- [ ] Roles table
- [ ] Permissions table
- [ ] Role_Permissions (many-to-many)
- [ ] User_Roles (many-to-many)
- [ ] Modules table
- [ ] Module_Permissions (many-to-many)
- [ ] Users table genişletme (role_id, organization_id)
- [ ] Index'ler ekle
- [ ] Migration çalıştır ve test et

**Deliverable:** Database schema hazır, migration başarılı

**SQL Dosyası:**
```sql
-- migrations/add_rbac_tables.sql
-- (Detaylar DASHBOARD_INTEGRATION_PLAN.md'de)
```

---

#### Gün 3: Backend API - Auth & Users
**Süre:** 1 gün  
**Görevler:**
- [ ] Auth routes oluştur: `backend/src/routes/auth.ts`
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - POST `/api/auth/logout`
  - GET `/api/auth/me`
  - GET `/api/auth/permissions`
- [ ] User routes oluştur: `backend/src/routes/users.ts`
  - GET `/api/users` (list)
  - GET `/api/users/:id`
  - POST `/api/users`
  - PATCH `/api/users/:id`
  - DELETE `/api/users/:id`
- [ ] Password hashing (bcrypt)
- [ ] JWT token generation
- [ ] Auth middleware güncelleme
- [ ] Test endpoints (Postman/curl)

**Deliverable:** Auth ve User API endpoints çalışıyor

---

#### Gün 4: Backend API - Roles & Permissions
**Süre:** 1 gün  
**Görevler:**
- [ ] Role routes: `backend/src/routes/roles.ts`
  - GET `/api/roles`
  - POST `/api/roles`
  - PATCH `/api/roles/:id`
  - DELETE `/api/roles/:id`
- [ ] Permission routes: `backend/src/routes/permissions.ts`
  - GET `/api/permissions`
  - POST `/api/permissions`
- [ ] Role-Permission management endpoints
- [ ] Permission middleware: `backend/src/middleware/permissions.ts`
  ```typescript
  export const requirePermission = (resource: string, action: string) => {
    // Permission kontrolü
  };
  ```
- [ ] Test endpoints

**Deliverable:** Roles ve Permissions API hazır

---

#### Gün 5: Frontend - Auth Provider & Layout
**Süre:** 1 gün  
**Görevler:**
- [ ] Auth provider oluştur: `src/core/auth/authProvider.ts`
  - login, logout, check, getIdentity, getPermissions
- [ ] Data provider oluştur: `src/core/data/dataProvider.ts`
  - REST API ile bağlantı
- [ ] Layout component: `src/core/layout/DashboardLayout.tsx`
  - Sidebar
  - Header
  - Main content area
- [ ] Sidebar component: `src/core/layout/Sidebar.tsx`
  - Module listesi
  - Navigation
- [ ] Header component: `src/core/layout/Header.tsx`
  - User menu
  - Notifications
- [ ] Routing setup (React Router)
- [ ] Test: Login flow çalışıyor mu?

**Deliverable:** Temel dashboard layout ve auth çalışıyor

---

### 🟢 HAFTA 2: Core Modules (5 gün)

#### Gün 6: User Management Module
**Süre:** 1 gün  
**Görevler:**
- [ ] User list component: `src/modules/UserManagement/UserList.tsx`
  - Table view
  - Search/filter
  - Pagination
- [ ] User create component: `src/modules/UserManagement/UserCreate.tsx`
  - Form validation
  - Role selection
- [ ] User edit component: `src/modules/UserManagement/UserEdit.tsx`
- [ ] User show component: `src/modules/UserManagement/UserShow.tsx`
- [ ] User module index: `src/modules/UserManagement/index.tsx`
- [ ] Refine resource tanımla
- [ ] Permission kontrolleri ekle

**Deliverable:** User management modülü çalışıyor

---

#### Gün 7: Role Management Module
**Süre:** 1 gün  
**Görevler:**
- [ ] Role list component: `src/modules/RoleManagement/RoleList.tsx`
- [ ] Role create/edit component: `src/modules/RoleManagement/RoleForm.tsx`
- [ ] Permission matrix component: `src/modules/RoleManagement/PermissionMatrix.tsx`
  - Checkbox matrix (Resource x Action)
  - Visual permission management
- [ ] Role module index
- [ ] Refine resource tanımla
- [ ] Permission kontrolleri

**Deliverable:** Role management modülü çalışıyor

---

#### Gün 8: Permission System Implementation
**Süre:** 1 gün  
**Görevler:**
- [ ] Permission hook: `src/core/permissions/usePermissions.ts`
  ```typescript
  const { canAccess, canAccessModule, permissions } = usePermissions();
  ```
- [ ] Permission provider: `src/core/permissions/permissionProvider.ts`
- [ ] Permission guard component: `src/core/permissions/PermissionGuard.tsx`
  ```typescript
  <PermissionGuard resource="bilan" action="create">
    <CreateButton />
  </PermissionGuard>
  ```
- [ ] Module-level permission hook: `src/core/permissions/useModulePermissions.ts`
- [ ] Test: Permission kontrolleri çalışıyor mu?

**Deliverable:** Permission sistemi tam çalışıyor

---

#### Gün 9: Module Registry & Dynamic Loading
**Süre:** 1 gün  
**Görevler:**
- [ ] Module registry: `src/core/modules/ModuleRegistry.ts`
  ```typescript
  export const modules = [
    {
      id: "bilan",
      name: "Bilan de Compétences",
      component: BilanModule,
      route: "/bilan",
      permissions: ["bilan:read"],
      icon: "📊",
    },
    // ...
  ];
  ```
- [ ] Module loader: `src/core/modules/ModuleLoader.tsx`
  - Dynamic import
  - Lazy loading
  - Permission-based rendering
- [ ] Sidebar'da modüller göster
- [ ] Routing ile modül entegrasyonu
- [ ] Test: Modüller permission'a göre görünüyor mu?

**Deliverable:** Modül sistemi çalışıyor

---

#### Gün 10: Initial Data & Seeding
**Süre:** 1 gün  
**Görevler:**
- [ ] Seed script oluştur: `backend/src/scripts/seed.ts`
- [ ] Default roles oluştur:
  - Admin
  - Bilan Manager
  - Bilan User
  - Viewer
- [ ] Default permissions oluştur:
  - bilan:*
  - users:*
  - roles:*
- [ ] Default admin user oluştur
- [ ] Module kayıtları oluştur
- [ ] Seed script çalıştır
- [ ] Test: Default data var mı?

**Deliverable:** Database'de default data hazır

---

### 🟡 HAFTA 3: BILAN Module Entegrasyonu (5 gün)

#### Gün 11: BILAN Module Wrapper
**Süre:** 1 gün  
**Görevler:**
- [ ] BILAN module klasörü: `src/modules/BilanModule/`
- [ ] Module wrapper: `src/modules/BilanModule/index.tsx`
  ```typescript
  export const BilanModule = () => {
    const { canAccess } = usePermissions();
    
    if (!canAccess("bilan", "read")) {
      return <AccessDenied />;
    }
    
    return (
      <ModuleLayout title="Bilan de Compétences">
        <BilanApp />
      </ModuleLayout>
    );
  };
  ```
- [ ] Module layout component
- [ ] Permission props'ları mevcut BILAN app'e geçir
- [ ] Routing entegrasyonu
- [ ] Test: BILAN modülü dashboard'da görünüyor mu?

**Deliverable:** BILAN modülü dashboard'a entegre

---

#### Gün 12: Mevcut BILAN App Adaptasyonu - Part 1
**Süre:** 1 gün  
**Görevler:**
- [ ] Mevcut BILAN components'leri kopyala: `src/modules/BilanModule/components/`
- [ ] App.tsx'i adapte et: Permission props ekle
- [ ] Questionnaire.tsx güncelle: Permission kontrolleri ekle
- [ ] SummaryDashboard.tsx güncelle: Export permission kontrolleri
- [ ] API client güncelle: Auth headers ekle
- [ ] Test: BILAN flow çalışıyor mu?

**Deliverable:** BILAN uygulaması permission-aware

---

#### Gün 13: Mevcut BILAN App Adaptasyonu - Part 2
**Süre:** 1 gün  
**Görevler:**
- [ ] Assessment list component: `src/modules/BilanModule/AssessmentList.tsx`
  - Tüm assessment'ları göster (admin için)
  - User'ın kendi assessment'ları (user için)
- [ ] Assessment detail view
- [ ] Assessment management (create, edit, delete)
- [ ] Permission kontrolleri:
  - `bilan:assessment:create`
  - `bilan:assessment:read`
  - `bilan:assessment:update`
  - `bilan:assessment:delete`
- [ ] Test: Assessment management çalışıyor mu?

**Deliverable:** Assessment management hazır

---

#### Gün 14: Export & Analytics Permissions
**Süre:** 1 gün  
**Görevler:**
- [ ] Export permission kontrolleri:
  - `bilan:export:csv`
  - `bilan:export:pdf`
  - `bilan:export:json`
- [ ] SummaryDashboard.tsx'de permission kontrolleri
- [ ] Export butonları permission'a göre göster/gizle
- [ ] Analytics permission: `bilan:analytics:view`
- [ ] Dashboard component permission kontrolleri
- [ ] Test: Export ve analytics permission'a göre çalışıyor mu?

**Deliverable:** Export ve analytics permission-aware

---

#### Gün 15: BILAN Module - Advanced Features
**Süre:** 1 gün  
**Görevler:**
- [ ] Question management (admin için)
  - Soru listesi
  - Soru ekleme/düzenleme
  - Permission: `bilan:questions:manage`
- [ ] Analytics dashboard (admin için)
  - Bilan istatistikleri
  - Tamamlama oranları
  - Permission: `bilan:analytics:view`
- [ ] Module-specific permissions test
- [ ] Integration test: Tüm BILAN flow

**Deliverable:** BILAN modülü tam özellikli

---

### 🟠 HAFTA 4: Polish, Testing & Deploy (5 gün)

#### Gün 16: UI/UX Improvements
**Süre:** 1 gün  
**Görevler:**
- [ ] Dashboard theme customization
- [ ] Sidebar improvements
- [ ] Header improvements
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Responsive design
- [ ] Dark mode (opsiyonel)
- [ ] Accessibility improvements

**Deliverable:** UI/UX iyileştirildi

---

#### Gün 17: Multi-Tenant Support (Opsiyonel)
**Süre:** 1 gün  
**Görevler:**
- [ ] Organization model ekle
- [ ] Organization bazlı data isolation
- [ ] Organization selector (header'da)
- [ ] API queries'de organization filter
- [ ] Test: Multi-tenant çalışıyor mu?

**Deliverable:** Multi-tenant support (eğer gerekliyse)

---

#### Gün 18: Testing & Bug Fixes
**Süre:** 1 gün  
**Görevler:**
- [ ] Unit tests (critical components)
- [ ] Integration tests (auth flow, permission flow)
- [ ] E2E tests (critical paths)
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security review

**Deliverable:** Test coverage %60+, kritik bug'lar düzeltildi

---

#### Gün 19: Documentation
**Süre:** 1 gün  
**Görevler:**
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide (dashboard kullanımı)
- [ ] Admin guide (role/permission yönetimi)
- [ ] Developer guide (yeni modül ekleme)
- [ ] README güncelleme
- [ ] Code comments

**Deliverable:** Dokümantasyon tamamlandı

---

#### Gün 20: Deployment & Go-Live
**Süre:** 1 gün  
**Görevler:**
- [ ] Environment variables setup
- [ ] Database migration (production)
- [ ] Seed script çalıştır (production)
- [ ] Backend deploy
- [ ] Frontend deploy
- [ ] Smoke tests (production)
- [ ] Monitoring setup
- [ ] Go-live checklist

**Deliverable:** Production'da çalışıyor

---

## 📊 Detaylı Görev Listesi

### Backend Tasks

#### Database
- [ ] Migration: `add_rbac_tables.sql`
- [ ] Seed script: `seed.ts`
- [ ] Index optimization
- [ ] Query optimization

#### API Routes
- [ ] `/api/auth/*` - Authentication
- [ ] `/api/users/*` - User management
- [ ] `/api/roles/*` - Role management
- [ ] `/api/permissions/*` - Permission management
- [ ] `/api/modules/*` - Module management
- [ ] `/api/bilan/*` - BILAN endpoints (mevcut, genişletilecek)

#### Middleware
- [ ] `auth.ts` - Güncellenmiş auth middleware
- [ ] `permissions.ts` - Permission middleware (yeni)

### Frontend Tasks

#### Core
- [ ] Auth provider
- [ ] Data provider
- [ ] Permission provider
- [ ] Module registry
- [ ] Layout components

#### Modules
- [ ] User Management
- [ ] Role Management
- [ ] BILAN Module
- [ ] Analytics Module (opsiyonel)

#### Shared
- [ ] Permission Guard component
- [ ] Common components
- [ ] Hooks
- [ ] Utils

---

## 🔐 Permission Matrix

### BILAN Module Permissions

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `bilan:assessment:create` | Yeni bilan oluştur | User, Manager, Admin |
| `bilan:assessment:read` | Bilanları görüntüle | User, Manager, Admin, Viewer |
| `bilan:assessment:update` | Bilanları güncelle | Manager, Admin |
| `bilan:assessment:delete` | Bilanları sil | Admin |
| `bilan:export:csv` | CSV export | User, Manager, Admin |
| `bilan:export:pdf` | PDF export | User, Manager, Admin |
| `bilan:export:json` | JSON export | User, Manager, Admin |
| `bilan:analytics:view` | Analytics görüntüle | Manager, Admin |
| `bilan:questions:manage` | Soruları yönet | Admin |

### User Management Permissions

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `users:create` | Kullanıcı oluştur | Admin |
| `users:read` | Kullanıcıları görüntüle | Manager, Admin |
| `users:update` | Kullanıcıları güncelle | Admin |
| `users:delete` | Kullanıcıları sil | Admin |

### Role Management Permissions

| Permission | Description | Default Roles |
|------------|-------------|---------------|
| `roles:create` | Rol oluştur | Admin |
| `roles:read` | Rolleri görüntüle | Admin |
| `roles:update` | Rolleri güncelle | Admin |
| `roles:delete` | Rolleri sil | Admin |

---

## 🗂️ Dosya Yapısı (Final)

```
dashboard/
├── src/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── authProvider.ts
│   │   │   └── useAuth.ts
│   │   ├── data/
│   │   │   └── dataProvider.ts
│   │   ├── permissions/
│   │   │   ├── permissionProvider.ts
│   │   │   ├── usePermissions.ts
│   │   │   ├── useModulePermissions.ts
│   │   │   └── PermissionGuard.tsx
│   │   ├── modules/
│   │   │   ├── ModuleRegistry.ts
│   │   │   ├── ModuleLoader.tsx
│   │   │   └── ModuleLayout.tsx
│   │   └── layout/
│   │       ├── DashboardLayout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Header.tsx
│   ├── modules/
│   │   ├── BilanModule/
│   │   │   ├── index.tsx
│   │   │   ├── components/
│   │   │   │   ├── Questionnaire.tsx
│   │   │   │   ├── SummaryDashboard.tsx
│   │   │   │   ├── AssessmentList.tsx
│   │   │   │   └── ... (mevcut components)
│   │   │   └── hooks/
│   │   ├── UserManagement/
│   │   │   ├── index.tsx
│   │   │   ├── UserList.tsx
│   │   │   ├── UserCreate.tsx
│   │   │   ├── UserEdit.tsx
│   │   │   └── UserShow.tsx
│   │   ├── RoleManagement/
│   │   │   ├── index.tsx
│   │   │   ├── RoleList.tsx
│   │   │   ├── RoleForm.tsx
│   │   │   └── PermissionMatrix.tsx
│   │   └── Analytics/
│   │       ├── index.tsx
│   │       └── Dashboard.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── AccessDenied.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── hooks/
│   │   └── utils/
│   └── App.tsx
├── backend/
│   └── src/
│       ├── routes/
│       │   ├── auth.ts (yeni)
│       │   ├── users.ts (yeni)
│       │   ├── roles.ts (yeni)
│       │   ├── permissions.ts (yeni)
│       │   ├── modules.ts (yeni)
│       │   └── bilan/ (mevcut, genişletilecek)
│       ├── middleware/
│       │   ├── auth.ts (güncellenmiş)
│       │   └── permissions.ts (yeni)
│       └── scripts/
│           └── seed.ts (yeni)
└── migrations/
    └── add_rbac_tables.sql (yeni)
```

---

## 📦 Gerekli Paketler

### Frontend (Dashboard)
```json
{
  "dependencies": {
    "@refinedev/core": "^4.0.0",
    "@refinedev/react-router-v6": "^4.0.0",
    "@refinedev/simple-rest": "^4.0.0",
    "@refinedev/antd": "^5.0.0",
    "react-router-dom": "^6.0.0",
    "@tanstack/react-query": "^5.0.0",
    "antd": "^5.0.0"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "@hono/jwt": "^1.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.22.0"
  }
}
```

---

## ✅ Checklist - Her Gün Sonu

### Günlük Kontrol Listesi
- [ ] Kod commit edildi
- [ ] Testler çalışıyor
- [ ] Dokümantasyon güncellendi
- [ ] Bug'lar kaydedildi
- [ ] Sonraki günün görevleri hazır

### Haftalık Kontrol Listesi
- [ ] Haftalık hedefler tamamlandı
- [ ] Code review yapıldı
- [ ] Test coverage kontrol edildi
- [ ] Performance test edildi
- [ ] Dokümantasyon güncellendi

---

## 🚨 Riskler ve Çözümler

### Risk 1: Mevcut BILAN App Entegrasyonu Zor Olabilir
**Çözüm:** 
- Adım adım entegrasyon
- Component'leri tek tek taşı
- Her adımda test et

### Risk 2: Permission Sistemi Karmaşık Olabilir
**Çözüm:**
- Basit permission format kullan
- İyi dokümante et
- Helper hooks oluştur

### Risk 3: Süre Aşımı
**Çözüm:**
- MVP önce (core features)
- Nice-to-have özellikler sonra
- Haftalık review

### Risk 4: Performance Sorunları
**Çözüm:**
- Lazy loading kullan
- Code splitting
- Performance monitoring

---

## 📈 Başarı Kriterleri

### Teknik
- ✅ Tüm modüller çalışıyor
- ✅ Permission sistemi çalışıyor
- ✅ BILAN uygulaması entegre
- ✅ Test coverage >60%
- ✅ Performance <2s load time

### Fonksiyonel
- ✅ Admin kullanıcı yönetebiliyor
- ✅ Admin rol/permission yönetebiliyor
- ✅ User'lar BILAN kullanabiliyor
- ✅ Permission'a göre özellikler görünüyor/gizleniyor
- ✅ Export permission'a göre çalışıyor

### Business
- ✅ Multi-user support
- ✅ Role-based access
- ✅ Modüler yapı (yeni modüller eklenebilir)
- ✅ Production-ready

---

## 🎯 İlk Adımlar (Hemen Başlayabilirsiniz)

### 1. Refine Setup (30 dakika)
```bash
npm create refine-app@latest dashboard
cd dashboard
npm install
npm run dev
```

### 2. Database Schema (1 saat)
```bash
# Migration dosyası oluştur
touch migrations/add_rbac_tables.sql
# SQL yaz (DASHBOARD_INTEGRATION_PLAN.md'den)
# Migration çalıştır
```

### 3. İlk API Endpoint (1 saat)
```bash
# Auth endpoint oluştur
touch backend/src/routes/auth.ts
# Login endpoint yaz
# Test et
```

---

## 📞 Destek ve Kaynaklar

### Refine.dev
- **Dokümantasyon:** https://refine.dev/docs
- **Examples:** https://github.com/refinedev/refine/tree/master/examples
- **Community:** https://discord.gg/refine

### Mevcut Proje
- **Backend API:** `backend/src/routes/`
- **Database Schema:** `backend/src/db/schema.ts`
- **Frontend Components:** `components/`

---

## 📝 Notlar

- Her gün sonunda commit yapın
- Her hafta sonunda review yapın
- Blocking issue'ları hemen çözün
- Dokümantasyonu güncel tutun

---

**Hazırlayan:** AI Assistant  
**Tarih:** 12 Kasım 2024  
**Versiyon:** 1.0

**Sonraki Adım:** Gün 1'i başlat - Refine Setup! 🚀

