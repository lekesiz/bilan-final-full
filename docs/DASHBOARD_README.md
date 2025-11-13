# BILAN-EASY Dashboard Documentation

## Overview

The BILAN-EASY Dashboard is a comprehensive admin and user interface built with Refine.dev framework, providing a complete RBAC (Role-Based Access Control) system, assessment management, analytics, and user management capabilities.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 + TypeScript
- **UI Framework**: Refine.dev + Ant Design
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router v6
- **State Management**: Refine.dev hooks
- **Authentication**: JWT-based with localStorage
- **Backend**: Hono.js (Node.js/TypeScript)

### Project Structure

```
src/
├── core/
│   ├── App.tsx              # Main application router
│   ├── providers/           # Refine providers (auth, data)
│   ├── permissions/         # RBAC permission system
│   ├── layout/              # Header, Sider, Layout components
│   └── components/          # Reusable UI components
├── modules/
│   └── BilanModule/         # BILAN assessment module
pages/                       # Page components (CRUD pages)
components/                  # Feature components
services/                    # API client and services
```

## Features

### 1. Authentication & Authorization

- **Login/Register**: JWT-based authentication
- **Password Management**: 
  - Password reset via email (`/password-reset`)
  - Password update (`/password-update`)
- **RBAC System**: Role-based permissions for all resources
- **Permission Guards**: Component-level access control

### 2. Dashboard Home (`/dashboard`)

**Features:**
- **Statistics Cards**: Total assessments, completed, in progress, completion rate
- **Charts**:
  - Status Distribution (Pie Chart)
  - Package Distribution (Bar Chart)
  - Activity Trend (Line Chart - Last 7 days)
- **Quick Actions**: Start assessment, view assessments, analytics
- **Recent Activity**: Latest 5 assessments

**Access Control:**
- Requires `dashboard:read` permission

### 3. Analytics Dashboard (`/analytics`)

**Features:**
- Overview metrics (completion rate, average answers, etc.)
- Package distribution charts
- Coaching style distribution
- Drop-off analysis
- Status breakdown

**Access Control:**
- Requires `analytics:read`, `admin:read`, or `dashboard:read` permission

### 4. Assessment Management

**Pages:**
- **List** (`/assessments`): View all assessments with filtering
- **Show** (`/assessments/show/:id`): View assessment details
- **Create** (`/assessments/create`): Create new assessment
- **Edit** (`/assessments/edit/:id`): Edit existing assessment

**Access Control:**
- List: `bilan:assessment:read`
- Show: `bilan:assessment:read`
- Create: `bilan:assessment:create`
- Edit: `bilan:assessment:update`
- Delete: `bilan:assessment:delete`

### 5. User Management

**Pages:**
- **List** (`/users`): View all users
- **Show** (`/users/show/:id`): View user details
- **Create** (`/users/create`): Create new user
- **Edit** (`/users/edit/:id`): Edit user (name, email, roles, password)

**Access Control:**
- All operations require `users:*` permissions

### 6. Role & Permission Management

**Pages:**
- **List** (`/roles`): View all roles
- **Show** (`/roles/show/:id`): View role details and permissions
- **Create** (`/roles/create`): Create new role
- **Edit** (`/roles/edit/:id`): Edit role (name, description, permissions)

**Access Control:**
- All operations require `roles:*` permissions
- System roles cannot be edited/deleted

### 7. BILAN Assessment Module (`/bilan`)

**Features:**
- Multi-step assessment flow
- Package selection (Découverte, Approfondi, Stratégique)
- Personalization step
- Dynamic question generation (AI-powered)
- Summary dashboard with PDF export
- History view

**Access Control:**
- Requires `bilan:read` or `bilan:assessment:read` permission

## Permission System

### Permission Format

Permissions follow the format: `resource:action`

**Resources:**
- `users`, `roles`, `permissions`
- `bilan`, `bilan:assessment`
- `analytics`, `dashboard`, `admin`

**Actions:**
- `read`, `create`, `update`, `delete`

**Examples:**
- `users:read` - Can view users
- `users:create` - Can create users
- `bilan:assessment:read` - Can view assessments
- `analytics:read` - Can view analytics

### Using Permission Guards

```tsx
import { PermissionGuard } from '../src/core/permissions/PermissionGuard';

<PermissionGuard resource="users" action="read">
  <UsersList />
</PermissionGuard>

// Hide button if no permission (no error shown)
<PermissionGuard resource="users" action="create" showError={false}>
  <Button>Create User</Button>
</PermissionGuard>
```

### Using Permission Hooks

```tsx
import { usePermissions } from '../src/core/permissions/usePermissions';

const { canAccess } = usePermissions();

if (canAccess('users', 'create')) {
  // Show create button
}
```

## API Integration

### API Client

All API calls go through `services/apiClient.ts`:

```tsx
import { useApi } from '../services/apiClient';

const api = useApi();

// Assessments
await api.getAssessments({ limit: 10, offset: 0 });
await api.createAssessment(data);
await api.updateAssessment(id, data);
await api.deleteAssessment(id);

// Users
await api.getUsers({ limit: 10, offset: 0 });
await api.createUser(data);
await api.updateUser(id, data);
await api.deleteUser(id);

// Roles
await api.getRoles({ limit: 10, offset: 0 });
await api.createRole(data);
await api.updateRole(id, data);
await api.deleteRole(id);

// Analytics
await api.getAnalytics({ startDate: '2024-01-01', endDate: '2024-12-31' });

// Auth
await api.login(email, password);
await api.register(email, password, name);
await api.resetPassword(email);
await api.updatePassword(currentPassword, newPassword, token);
```

### Data Provider

Refine.dev data provider automatically handles:
- Pagination
- Filtering
- Sorting
- Error handling
- Token refresh on 401 errors

## Styling

### Theme

- **Light Mode**: Default
- **Dark Mode**: Toggle via header (ThemeToggle component)
- **Gradient Backgrounds**: Used in dashboard and login pages
- **Tailwind CSS**: Utility-first CSS framework

### Components

- **Cards**: White/dark background with shadow
- **Buttons**: Gradient buttons for primary actions
- **Charts**: Responsive charts with Recharts
- **Forms**: Ant Design Form components

## Navigation

### Header Menu

- **Profile**: User profile (placeholder)
- **Change Password**: Navigate to `/password-update`
- **Settings**: Settings page (placeholder)
- **Logout**: Sign out

### Sidebar Menu

- **Dashboard**: `/dashboard`
- **Bilan de Compétences**: `/bilan`
- **Assessments**: `/assessments`
- **Analytics**: `/analytics`
- **Users**: `/users` (requires permission)
- **Roles & Permissions**: `/roles` (requires permission)

## Error Handling

### Authentication Errors

- **401 Unauthorized**: Automatic logout and redirect to login
- **Token Expired**: Token validation on each request
- **Permission Denied**: PermissionGuard shows error or hides component

### API Errors

- **Network Errors**: Retry mechanism (3 attempts with exponential backoff)
- **Validation Errors**: Form-level error messages
- **Server Errors**: User-friendly error messages

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
```

### Adding New Pages

1. Create page component in `pages/`
2. Add route in `src/core/App.tsx`
3. Add menu item in `src/core/layout/Sider.tsx` (if needed)
4. Add permission guards if required

### Adding New Permissions

1. Add permission to database (via backend)
2. Assign permission to role
3. Use `PermissionGuard` or `usePermissions` hook in components

## Best Practices

1. **Always use Permission Guards** for protected content
2. **Use useApi hook** for API calls (handles authentication automatically)
3. **Handle loading states** with Refine hooks (`isLoading`)
4. **Use TypeScript** for type safety
5. **Follow Ant Design patterns** for consistent UI
6. **Test permission guards** before deploying

## Troubleshooting

### Dashboard not rendering

- Check `ThemedLayout` CSS overrides in `src/index.css`
- Verify component is wrapped in `Authenticated` route

### Permission errors

- Check user's role and permissions in database
- Verify permission format: `resource:action`
- Check `PermissionGuard` props

### API errors

- Check `VITE_API_URL` environment variable
- Verify JWT token in localStorage
- Check backend logs for detailed errors

## Future Enhancements

- [ ] User profile page
- [ ] Settings page
- [ ] Email notifications
- [ ] Advanced filtering and search
- [ ] Export functionality (CSV, Excel)
- [ ] Real-time updates (WebSocket)
- [ ] Mobile responsive improvements
- [ ] Internationalization (i18n) for all pages

## Support

For issues or questions:
- Check backend API documentation: `docs/API_DOCUMENTATION.md`
- Review developer guide: `docs/DEVELOPER_GUIDE.md`
- Check admin guide: `docs/ADMIN_GUIDE.md`

