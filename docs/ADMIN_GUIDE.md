# 🔐 Admin Guide - BILAN-EASY Dashboard

Bu rehber, BILAN-EASY dashboard'unun admin özelliklerini ve RBAC (Role-Based Access Control) sistemini kullanmanıza yardımcı olur.

---

## 🚀 Admin Girişi

### İlk Admin Kullanıcı

Database seed script'i çalıştırıldığında otomatik olarak bir admin kullanıcı oluşturulur:

- **Email**: `admin@bilan-easy.com` (varsayılan)
- **Password**: Seed script'inde belirtilen şifre
- **Role**: `admin`

### Admin Yetkileri

Admin kullanıcılar şu yetkilere sahiptir:

- ✅ Tüm kullanıcıları görüntüleme ve yönetme
- ✅ Rolleri ve permission'ları yönetme
- ✅ Tüm bilanları görüntüleme
- ✅ Analytics dashboard'a erişim
- ✅ Sistem ayarlarını yönetme

---

## 👥 User Management

### Kullanıcı Listesi

1. Sidebar'dan **"Users"** menüsüne gidin
2. Tüm kullanıcıları görebilirsiniz:
   - **Name**: Kullanıcı adı
   - **Email**: Email adresi
   - **Roles**: Kullanıcının rolleri (tag'ler olarak)
   - **Status**: Active/Inactive
   - **Last Login**: Son giriş tarihi

### Yeni Kullanıcı Ekleme

1. **"Create"** butonuna tıklayın
2. Formu doldurun:
   - **Email**: Kullanıcının email adresi
   - **Password**: Şifre (minimum 8 karakter)
   - **Name**: Kullanıcı adı
   - **Roles**: Kullanıcıya atanacak rolleri seçin
3. **"Save"** butonuna tıklayın

### Kullanıcı Düzenleme

1. Kullanıcı listesinde bir kullanıcının yanındaki **"Edit"** butonuna tıklayın
2. Bilgileri güncelleyin:
   - **Name**: İsim değiştirme
   - **Status**: Active/Inactive durumu
   - **Roles**: Rolleri ekle/çıkar
3. **"Save"** butonuna tıklayın

### Kullanıcı Silme

1. Kullanıcı listesinde bir kullanıcının yanındaki **"Delete"** butonuna tıklayın
2. Onaylayın

**⚠️ Dikkat:** System rolleri olan kullanıcılar silinemez.

---

## 🔑 Role Management

### Rol Listesi

1. Sidebar'dan **"Roles & Permissions"** menüsüne gidin
2. Tüm rolleri görebilirsiniz:
   - **Name**: Rol adı
   - **Description**: Rol açıklaması
   - **Type**: System (kırmızı) veya Custom (mavi)
   - **Permissions**: İlk 3 permission gösterilir, daha fazlası için "+X more" tag'i

### Varsayılan Roller

Sistem şu rolleri içerir:

- **admin**: Tüm yetkilere sahip
- **bilan-manager**: Bilan yönetimi ve analytics
- **bilan-user**: Bilan oluşturma ve görüntüleme
- **viewer**: Sadece görüntüleme

### Yeni Rol Oluşturma

1. **"Create"** butonuna tıklayın
2. Formu doldurun:
   - **Name**: Rol adı (örn: `custom-role`)
   - **Description**: Rol açıklaması
   - **Permissions**: Permission matrix'ten seçin
3. **"Save"** butonuna tıklayın

### Rol Düzenleme

1. Rol listesinde bir rolün yanındaki **"Edit"** butonuna tıklayın
2. **Permission Matrix**'te permission'ları seçin/kaldırın:
   - Her satır bir **Resource** (örn: `bilan`, `users`)
   - Her sütun bir **Action** (örn: `read`, `create`, `update`, `delete`)
   - Checkbox'ları işaretleyerek permission'ları atayın
3. **"Save"** butonuna tıklayın

### Rol Silme

1. Rol listesinde bir rolün yanındaki **"Delete"** butonuna tıklayın
2. Onaylayın

**⚠️ Dikkat:**
- System rolleri silinemez
- Kullanıcılara atanmış rolleri silmek için önce kullanıcılardan kaldırmanız gerekir

---

## 🔐 Permission System

### Permission Format

Permission'lar şu formatta tanımlanır:

```
<resource>:<action>
```

**Örnekler:**
- `bilan:read` - Bilan görüntüleme
- `bilan:assessment:create` - Bilan oluşturma
- `users:update` - Kullanıcı güncelleme
- `roles:delete` - Rol silme

### Permission Resources

- **bilan**: Bilan modülü
- **bilan:assessment**: Assessment yönetimi
- **bilan:export**: Export işlemleri
- **bilan:analytics**: Analytics görüntüleme
- **users**: Kullanıcı yönetimi
- **roles**: Rol yönetimi
- **permissions**: Permission yönetimi
- **analytics**: Analytics dashboard
- **admin**: Admin yetkileri

### Permission Actions

- **read**: Görüntüleme
- **create**: Oluşturma
- **update**: Güncelleme
- **delete**: Silme

### Permission Matrix

Permission Matrix'te:

- ✅ **Checked**: Rol bu permission'a sahip
- ⬜ **Unchecked**: Rol bu permission'a sahip değil

**Örnek:**
```
Resource      | read | create | update | delete
--------------|------|--------|--------|--------
bilan         |  ✅  |   ✅   |   ⬜   |   ⬜
users         |  ✅  |   ✅   |   ✅   |   ✅
roles         |  ✅  |   ✅   |   ✅   |   ✅
```

---

## 📊 Analytics Dashboard

### Analytics'e Erişim

1. Sidebar'dan **"Analytics"** menüsüne gidin
2. Veya Dashboard'dan **"View Analytics"** butonuna tıklayın

### Analytics Metrikleri

- **Overview Cards**:
  - Total Assessments
  - Completion Rate
  - Average Completion Time
  - Total Answers

- **Package Distribution**: Hangi paketlerin ne kadar kullanıldığı
- **Coaching Style Distribution**: Coaching style dağılımı
- **Drop-off Analysis**: Hangi aşamada bırakıldığı (3 phase)

### Tarih Filtreleme

- **Start Date** ve **End Date** seçerek belirli bir tarih aralığına göre filtreleyebilirsiniz

---

## 🔍 Assessment Yönetimi

### Tüm Assessment'ları Görüntüleme

1. Sidebar'dan **"Assessments"** menüsüne gidin
2. Tüm kullanıcıların bilanlarını görebilirsiniz:
   - **User Name**: Kullanıcı adı
   - **Package**: Paket tipi
   - **Status**: Durum (completed, in_progress, abandoned)
   - **Progress**: Tamamlanma yüzdesi
   - **Started At**: Başlangıç tarihi

### Assessment Detayları

1. Assessment listesinde bir assessment'ın yanındaki **"View"** butonuna tıklayın
2. Detayları görebilirsiniz:
   - Kullanıcı bilgileri
   - Tüm cevaplar
   - Özet bilgileri

### Assessment Silme

1. Assessment listesinde bir assessment'ın yanındaki **"Delete"** butonuna tıklayın
2. Onaylayın

**⚠️ Dikkat:** Assessment silindiğinde tüm cevaplar ve özetler de silinir.

---

## 🛠️ System Configuration

### Database Seeding

İlk kurulumda database'i seed etmek için:

```bash
cd backend
npm run seed
```

Bu script:
- Varsayılan rolleri oluşturur
- Varsayılan permission'ları oluşturur
- Admin kullanıcısı oluşturur
- Dashboard modüllerini kaydeder

### Environment Variables

Backend için gerekli environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

---

## 🔒 Security Best Practices

### 1. Password Policy

- Minimum 8 karakter
- Karmaşık şifreler önerilir
- Düzenli şifre değişikliği

### 2. Role Assignment

- Kullanıcılara sadece gerekli rolleri atayın
- **Principle of Least Privilege** uygulayın

### 3. System Roles

- System rolleri (`admin`, `bilan-manager`, vb.) değiştirilemez
- System rolleri silinemez

### 4. Audit Trail

- Kullanıcı aktivitelerini takip edin
- Last login bilgilerini kontrol edin

---

## 📝 Best Practices

### User Management

1. **Yeni kullanıcı eklerken:**
   - Uygun rolleri atayın
   - İlk girişte şifre değiştirmesini isteyin

2. **Kullanıcı düzenlerken:**
   - Sadece gerekli değişiklikleri yapın
   - Rolleri dikkatli atayın

3. **Kullanıcı silerken:**
   - Önce kullanıcının aktif assessment'larını kontrol edin
   - Gerekirse verileri yedekleyin

### Role Management

1. **Yeni rol oluştururken:**
   - Açıklayıcı isimler kullanın
   - Sadece gerekli permission'ları atayın

2. **Rol düzenlerken:**
   - Permission değişikliklerinin etkilerini düşünün
   - Test edin

3. **Rol silerken:**
   - Önce kullanıcılardan kaldırın
   - Alternatif roller önerin

---

## 🆘 Troubleshooting

### Kullanıcı giriş yapamıyor

1. Kullanıcının **Status**'unu kontrol edin (Active olmalı)
2. Şifresini sıfırlayın
3. Rollerini kontrol edin

### Permission hatası

1. Kullanıcının rollerini kontrol edin
2. Rolün permission'larını kontrol edin
3. Permission matrix'te doğru permission'ların seçili olduğundan emin olun

### System role hatası

- System rolleri değiştirilemez/silinemez
- Custom rol oluşturup kullanın

---

**Son Güncelleme:** 12 Kasım 2024

