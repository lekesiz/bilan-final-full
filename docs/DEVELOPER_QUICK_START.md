# Developer Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
psql --version  # Should be 14+ (or use Docker)
```

### 1. Clone & Install
```bash
git clone https://github.com/lekesiz/bilan-final-full.git
cd bilan-final-full
npm install
cd backend && npm install && cd ..
```

### 2. Setup Environment

**Frontend** (`.env.local`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_BACKEND_AI_URL=http://localhost:3001/api/ai
```

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_db
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d

# AI Providers (at least one required)
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
GEMINI_API_KEY=your-key
```

### 3. Database Setup
```bash
# Create database
createdb bilan_db

# Or use Docker
docker-compose up -d postgres
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

Visit: http://localhost:3000

## 📁 Project Structure

```
bilan-final-full/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database schema
│   │   └── middleware/  # Auth, validation
│   └── package.json
│
├── src/                 # Frontend source
│   ├── core/           # Core app logic
│   │   ├── App.tsx     # Main router
│   │   ├── components/ # Reusable components
│   │   └── layout/     # Layout components
│   ├── pages/          # Page components
│   └── i18n/           # Translations
│
├── pages/              # Additional pages
├── components/         # Feature components
├── services/           # API client
└── package.json
```

## 🔑 Key Concepts

### Authentication Flow
1. User logs in → Backend returns JWT
2. Frontend stores token in localStorage
3. Token sent in `Authorization: Bearer <token>` header
4. Backend validates token on each request

### Permission System (RBAC)
- Format: `resource:action` (e.g., `users:read`, `roles:create`)
- Roles have multiple permissions
- Users have multiple roles
- Components use `<PermissionGuard>` for access control

### Data Flow
```
Component → useTable/useList → API Client → Backend → Database
                ↓
         React Query Cache
                ↓
         Component Re-render
```

## 🛠️ Common Tasks

### Adding a New Page
1. Create component in `pages/`
2. Add route in `src/core/App.tsx`
3. Add menu item in `src/core/layout/Sider.tsx`
4. Add i18n keys in `src/i18n/locales/*.json`

### Adding a New API Endpoint
1. Create route in `backend/src/routes/`
2. Add to `backend/src/app.ts`
3. Add method to `services/apiClient.ts`
4. Use in components via `useApi()` hook

### Adding a New Permission
1. Add to database (via seed or migration)
2. Assign to roles
3. Use `<PermissionGuard>` in components

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🐛 Debugging

### Frontend
- React DevTools
- Network tab for API calls
- Console logs (dev mode only)

### Backend
- Check `backend/src/index.ts` logs
- Database: `psql bilan_db`
- API: http://localhost:3001/api/health

### Common Issues
- **CORS errors**: Check `FRONTEND_URL` in backend `.env`
- **Database errors**: Check `DATABASE_URL` and connection
- **Auth errors**: Check JWT token in localStorage

## 📚 Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Read [API.md](./API.md) for API documentation
- Check [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for detailed guides

