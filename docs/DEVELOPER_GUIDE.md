# 👨‍💻 Developer Guide - BILAN-EASY

Bu rehber, BILAN-EASY projesine yeni modüller eklemek ve geliştirme yapmak için gereken bilgileri içerir.

---

## 🏗️ Project Structure

```
bilan-101120251636/
├── src/
│   ├── core/                    # Core dashboard functionality
│   │   ├── App.tsx              # Main Refine app wrapper
│   │   ├── providers/           # Auth & Data providers
│   │   ├── layout/              # Dashboard layout components
│   │   ├── permissions/         # Permission system
│   │   ├── modules/             # Module registry & loader
│   │   └── components/         # Shared components
│   ├── modules/                 # Feature modules
│   │   └── BilanModule/        # BILAN module
│   ├── i18n/                   # Internationalization
│   └── test/                   # Test files
├── backend/
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── db/                 # Database schema & client
│   │   ├── middleware/         # Middleware (auth, permissions)
│   │   └── scripts/            # Seed scripts
│   └── test/                   # Backend tests
├── pages/                      # Dashboard pages
├── components/                 # Shared React components
└── docs/                       # Documentation
```

---

## 🆕 Yeni Modül Ekleme

### 1. Backend Route Oluşturma

**Dosya:** `backend/src/routes/myModule.ts`

```typescript
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { success, error } from '../utils/response.js';

const app = new Hono();

// GET /api/my-module
app.get('/', requireAuth, requirePermission('my-module', 'read'), async (c) => {
  try {
    // Your logic here
    return success(c, { data: [] });
  } catch (err) {
    return error(c, 'Failed to fetch data', 500);
  }
});

export default app;
```

**Dosya:** `backend/src/app.ts`

```typescript
import myModuleRoutes from './routes/myModule.js';

// Add route
app.route('/api/my-module', myModuleRoutes);
```

### 2. Frontend Module Oluşturma

**Dosya:** `src/modules/MyModule/index.tsx`

```typescript
import React from 'react';
import { usePermissions } from '../../core/permissions/usePermissions';
import { PermissionGuard } from '../../core/permissions/PermissionGuard';
import { ModuleLayout } from './ModuleLayout';
import MyModuleApp from './MyModuleApp';

export const MyModule: React.FC = () => {
  const { canAccess } = usePermissions();

  if (!canAccess('my-module', 'read')) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this module.</p>
      </div>
    );
  }

  return (
    <ModuleLayout title="My Module">
      <MyModuleApp />
    </ModuleLayout>
  );
};
```

**Dosya:** `src/modules/MyModule/MyModuleApp.tsx`

```typescript
import React from 'react';

const MyModuleApp: React.FC = () => {
  return (
    <div>
      <h1>My Module</h1>
      {/* Your module content */}
    </div>
  );
};

export default MyModuleApp;
```

### 3. Module Registry'ye Ekleme

**Dosya:** `src/core/modules/ModuleRegistry.ts`

```typescript
import { MyModule } from '../../modules/MyModule';

export const modules = [
  // ... existing modules
  {
    id: 'my-module',
    name: 'My Module',
    component: MyModule,
    route: '/my-module',
    permissions: ['my-module:read'],
    icon: '📦',
  },
];
```

### 4. Routing Ekleme

**Dosya:** `src/core/App.tsx`

```typescript
import { MyModule } from '../modules/MyModule';

// In Routes:
<Route path="/my-module/*" element={<MyModule />} />
```

### 5. Sidebar'a Ekleme

**Dosya:** `src/core/layout/Sider.tsx`

```typescript
{
  key: '/my-module',
  icon: <MyIcon />,
  label: 'My Module',
  onClick: () => push('/my-module'),
  visible: canAccess('my-module', 'read'),
},
```

### 6. Permission Ekleme

**Database Seed Script:** `backend/src/scripts/seed.ts`

```typescript
// Add permissions
await db.insert(permissions).values([
  {
    resource: 'my-module',
    action: 'read',
    description: 'Read my module data',
  },
  {
    resource: 'my-module',
    action: 'create',
    description: 'Create my module data',
  },
  // ... more permissions
]);

// Assign to roles
await db.insert(rolePermissions).values([
  {
    roleId: adminRole.id,
    permissionId: myModuleReadPermission.id,
  },
]);
```

---

## 🔐 Permission System

### usePermissions Hook

```typescript
import { usePermissions } from '../core/permissions/usePermissions';

const MyComponent: React.FC = () => {
  const { canAccess, canAccessAny, canAccessAll } = usePermissions();

  if (canAccess('users', 'read')) {
    // Show user list
  }

  if (canAccessAny([
    { resource: 'bilan', action: 'read' },
    { resource: 'bilan', action: 'assessment:read' },
  ])) {
    // Show bilan if user has any of these permissions
  }

  return <div>Content</div>;
};
```

### PermissionGuard Component

```typescript
import { PermissionGuard } from '../core/permissions/PermissionGuard';

const MyComponent: React.FC = () => {
  return (
    <PermissionGuard resource="users" action="create">
      <CreateButton />
    </PermissionGuard>
  );
};
```

### Backend Permission Middleware

```typescript
import { requirePermission } from '../middleware/permissions.js';

// Single permission
app.get('/', requireAuth, requirePermission('users', 'read'), async (c) => {
  // ...
});

// Multiple permissions (OR)
import { requireAnyPermission } from '../middleware/permissions.js';

app.get('/', requireAuth, requireAnyPermission([
  { resource: 'bilan', action: 'read' },
  { resource: 'admin', action: 'read' },
]), async (c) => {
  // ...
});
```

---

## 🗄️ Database Schema

### Yeni Tablo Ekleme

**Dosya:** `backend/src/db/schema.ts`

```typescript
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const myTable = pgTable('my_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Migration:** `migrations/add_my_table.sql`

```sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🧪 Testing

### Component Test

**Dosya:** `src/test/components/MyComponent.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### API Route Test

**Dosya:** `backend/src/test/routes/myModule.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import myModuleRoutes from '../../routes/myModule.js';

const app = new Hono().route('/api/my-module', myModuleRoutes);

describe('MyModule API', () => {
  it('should return data', async () => {
    const res = await app.request('/api/my-module', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });
    expect(res.status).toBe(200);
  });
});
```

---

## 🌐 Internationalization (i18n)

### Translation Key Ekleme

**Dosya:** `src/i18n/locales/fr.json`

```json
{
  "myModule": {
    "title": "Mon Module",
    "description": "Description du module",
    "actions": {
      "create": "Créer",
      "edit": "Modifier",
      "delete": "Supprimer"
    }
  }
}
```

**Component'te Kullanım:**

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('myModule.title')}</h1>
      <p>{t('myModule.description')}</p>
      <button>{t('myModule.actions.create')}</button>
    </div>
  );
};
```

---

## 🎨 UI Components

### Shared Components

**LoadingState:**
```typescript
import { LoadingState } from '../core/components/LoadingState';

<LoadingState message="Loading data..." />
```

**ErrorState:**
```typescript
import { ErrorState } from '../core/components/ErrorState';

<ErrorState
  message="Failed to load"
  onRetry={() => refetch()}
/>
```

**EmptyState:**
```typescript
import { EmptyState } from '../core/components/EmptyState';

<EmptyState
  title="No data"
  description="Create your first item"
  actionLabel="Create"
  onAction={() => navigate('/create')}
/>
```

---

## 📦 API Client

### API Method Ekleme

**Dosya:** `services/apiClient.ts`

```typescript
export const api = {
  // ... existing methods
  
  async getMyModuleData() {
    const response = await fetch(`${API_URL}/my-module`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  async createMyModuleData(data: any) {
    const response = await fetch(`${API_URL}/my-module`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
```

---

## 🔧 Development Workflow

### 1. Feature Branch Oluşturma

```bash
git checkout -b feature/my-new-module
```

### 2. Development

- Backend route'ları oluştur
- Frontend module'ü oluştur
- Test yaz
- i18n key'leri ekle

### 3. Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test
```

### 4. Code Review Checklist

- [ ] Backend route'lar test edildi
- [ ] Frontend component'ler test edildi
- [ ] Permission kontrolleri eklendi
- [ ] i18n key'leri eklendi
- [ ] Documentation güncellendi
- [ ] Code comments eklendi

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add my new module"
git push origin feature/my-new-module
```

---

## 📚 Code Style

### TypeScript

- Strict mode kullan
- Interface'leri export et
- Type safety'yi koru

### React

- Functional components kullan
- Hooks kullan (useState, useEffect, etc.)
- Props interface'lerini tanımla

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMyHook.ts`)
- **Utils**: camelCase (`myUtil.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT.ts`)

---

## 🐛 Debugging

### Frontend

```typescript
// Console logging
console.log('Debug:', data);

// React DevTools
// Install React DevTools browser extension
```

### Backend

```typescript
// Console logging
console.error('Error:', err);

// Database queries
console.log('Query result:', result);
```

---

## 📖 Resources

- [Refine.dev Documentation](https://refine.dev/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Hono.js Documentation](https://hono.dev)

---

**Son Güncelleme:** 12 Kasım 2024

