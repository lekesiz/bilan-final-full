-- ============================================
-- RBAC Tables Migration
-- BILAN-EASY Dashboard Entegrasyonu
-- Tarih: 12 Kasım 2024
-- ============================================

-- Table: users (kullanıcılar)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Table: roles (roller)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Table: permissions (izinler)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(resource, action)
);

CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);

-- Table: role_permissions (many-to-many: roles <-> permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Table: user_roles (many-to-many: users <-> roles)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Table: dashboard_modules (dashboard modülleri)
CREATE TABLE IF NOT EXISTS dashboard_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  route VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_modules_name ON dashboard_modules(name);
CREATE INDEX IF NOT EXISTS idx_dashboard_modules_route ON dashboard_modules(route);
CREATE INDEX IF NOT EXISTS idx_dashboard_modules_is_active ON dashboard_modules(is_active);

-- Table: module_permissions (many-to-many: modules <-> permissions)
CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES dashboard_modules(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_module_permissions_module_id ON module_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_permissions_permission_id ON module_permissions(permission_id);

-- ============================================
-- Seed Data: Default Roles and Permissions
-- ============================================

-- Default Roles
INSERT INTO roles (name, description, is_system) VALUES
  ('admin', 'System Administrator - Full access', true),
  ('user', 'Regular User - Basic access', true),
  ('coach', 'Career Coach - Can view assessments', true)
ON CONFLICT (name) DO NOTHING;

-- Default Permissions
INSERT INTO permissions (resource, action, description) VALUES
  -- User Management
  ('users', 'create', 'Create new users'),
  ('users', 'read', 'View users'),
  ('users', 'update', 'Update users'),
  ('users', 'delete', 'Delete users'),
  
  -- Role Management
  ('roles', 'create', 'Create new roles'),
  ('roles', 'read', 'View roles'),
  ('roles', 'update', 'Update roles'),
  ('roles', 'delete', 'Delete roles'),
  
  -- Assessment Management
  ('bilan:assessment', 'create', 'Create assessments'),
  ('bilan:assessment', 'read', 'View assessments'),
  ('bilan:assessment', 'update', 'Update assessments'),
  ('bilan:assessment', 'delete', 'Delete assessments'),
  
  -- Analytics
  ('analytics', 'read', 'View analytics dashboard'),
  
  -- Module Management
  ('modules', 'read', 'View modules'),
  ('modules', 'update', 'Update modules')
ON CONFLICT (resource, action) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign basic permissions to user role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'user'
  AND p.resource IN ('bilan:assessment', 'analytics', 'modules')
  AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign coach permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'coach'
  AND p.resource IN ('bilan:assessment', 'analytics')
  AND p.action IN ('read')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Default Dashboard Modules
INSERT INTO dashboard_modules (name, display_name, description, icon, route, "order", is_active) VALUES
  ('dashboard', 'Dashboard', 'Main dashboard overview', 'DashboardOutlined', '/dashboard', 1, true),
  ('assessments', 'Assessments', 'Manage assessments', 'FileTextOutlined', '/assessments', 2, true),
  ('analytics', 'Analytics', 'View analytics and reports', 'BarChartOutlined', '/analytics', 3, true),
  ('users', 'Users', 'Manage users', 'UserOutlined', '/users', 4, true),
  ('roles', 'Roles & Permissions', 'Manage roles and permissions', 'SafetyOutlined', '/roles', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Assign module permissions
INSERT INTO module_permissions (module_id, permission_id)
SELECT 
  m.id as module_id,
  p.id as permission_id
FROM dashboard_modules m
CROSS JOIN permissions p
WHERE 
  (m.name = 'users' AND p.resource = 'users')
  OR (m.name = 'roles' AND p.resource = 'roles')
  OR (m.name = 'assessments' AND p.resource = 'bilan:assessment')
  OR (m.name = 'analytics' AND p.resource = 'analytics')
ON CONFLICT (module_id, permission_id) DO NOTHING;

-- ============================================
-- Migration Complete
-- ============================================

