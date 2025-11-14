# BILAN-EASY - Skills Assessment Platform

A comprehensive, modern skills assessment platform built with React, TypeScript, and Node.js. This application enables organizations to conduct skills assessments, manage users and roles, track analytics, and maintain audit trails.

## 🚀 Features

### Core Functionality
- **Skills Assessment System**: Interactive questionnaire system with AI-powered question generation
- **User Management**: Complete CRUD operations for users with role-based access control
- **Role & Permission Management**: Flexible RBAC system with granular permissions
- **Analytics Dashboard**: Comprehensive analytics with charts and metrics
- **Audit Trail**: Complete activity logging for compliance and security

### Advanced Features
- **Bulk Operations**: Bulk delete, update, and activate/deactivate operations
- **Advanced Search & Filters**: Multi-criteria filtering with date ranges, status, and custom filters
- **Export Functionality**: Export data to CSV, Excel, and PDF formats
- **Internationalization**: Full i18n support for 4 languages (English, French, Turkish, German)
- **Responsive Design**: Modern, mobile-friendly UI with Tailwind CSS
- **Dark Mode Support**: Theme switching capability

### UX Enhancements
- **Loading Skeletons**: Smooth loading states for better UX
- **Empty States**: Context-aware empty state messages
- **Confirmation Modals**: Safe delete operations with confirmation
- **Tooltips**: Helpful inline guidance for form fields
- **Keyboard Shortcuts**: Power user shortcuts (Ctrl+K for command palette, Ctrl+/ for shortcuts)

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** with TypeScript (downgraded from React 19 for stability)
- **Refine.dev** - Data-driven admin framework
- **Ant Design 5** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **React Query (TanStack Query)** - Data fetching and caching
- **i18next** - Internationalization
- **Recharts** - Data visualization
- **jsPDF** - PDF generation
- **xlsx** - Excel export
- **file-saver** - File download handling

### Backend
- **Node.js** with TypeScript
- **Hono.js** - Fast web framework
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database
- **JWT** - Authentication
- **Zod** - Schema validation
- **Multi-Provider AI Service** - OpenAI, Anthropic Claude, Google Gemini with fallback

### Development Tools
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **TypeScript** - Type safety

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lekesiz/bilan-final-full.git
cd bilan-final-full
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

#### Docker Compose (Önerilen)

Docker Compose kullanıyorsanız, `.env` dosyası oluşturun:

```env
# Database
POSTGRES_USER=bilan_user
POSTGRES_PASSWORD=bilan_password
POSTGRES_DB=bilan_easy

# JWT Secret (GÜVENLİ BİR DEĞER KULLANIN!)
JWT_SECRET=your-secret-key-generate-with-openssl-rand-base64-32

# Optional: AI API Keys
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

**JWT_SECRET Oluşturma**:
```bash
openssl rand -base64 32
```

#### Frontend (.env.local) - Docker Kullanmıyorsanız

```env
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENAI_API_KEY=your-openai-key
VITE_CLAUDE_API_KEY=your-claude-key
```

#### Backend (backend/.env) - Docker Kullanmıyorsanız

```env
# Database
DATABASE_URL=postgresql://bilan_user:bilan_password@localhost:5432/bilan_easy

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT (GÜVENLİ BİR DEĞER KULLANIN!)
JWT_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
JWT_EXPIRES_IN=7d

# AI Providers (at least one required)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GEMINI_API_KEY=your-gemini-key
```

### 4. Database Setup

#### Docker Compose ile (Önerilen)

```bash
# Docker Compose ile tüm servisleri başlat
docker-compose up -d

# Database seed script'i çalıştır (admin kullanıcı oluşturur)
docker-compose exec backend npm run seed
```

**Varsayılan Admin Kullanıcı**:
- Email: `admin@bilan.com`
- Password: `admin123`
- Rol: `admin` (tüm permission'lar)

#### Manuel Kurulum

```bash
# PostgreSQL database oluştur
createdb bilan_easy

# Migrations çalıştır
cd backend
npm run db:migrate

# Seed data yükle (admin kullanıcı oluşturur)
npm run seed
```

### 5. Start Development Servers

#### Docker Compose ile (Önerilen)

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Servisleri durdur
docker-compose down
```

#### Manuel Kurulum

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📁 Project Structure

```
bilan-final-full/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── db/             # Database schema and client
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, permissions, etc.
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── tsconfig.json
├── src/                    # Frontend source
│   ├── core/               # Core application logic
│   │   ├── App.tsx         # Main app router
│   │   ├── components/     # Reusable components
│   │   ├── layout/         # Layout components
│   │   └── permissions/    # RBAC system
│   ├── i18n/               # Internationalization
│   ├── pages/              # Page components
│   └── services/           # API client
├── pages/                  # Additional pages
├── components/             # Shared components
├── services/               # Frontend services
├── package.json
└── README.md
```

## 🔐 Authentication & Authorization

### Authentication
- JWT-based authentication
- Session management
- Password hashing with bcrypt

### Authorization (RBAC)
- Role-based access control
- Granular permissions (resource:action)
- Permission guards on routes and components
- System roles (cannot be deleted)

### Default Roles
- **Admin**: Full access to all resources
- **User**: Basic access, can create assessments
- **Viewer**: Read-only access

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/permissions` - Get user permissions

### Users
- `GET /api/users` - List users (with filters)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get role details
- `POST /api/roles` - Create role
- `PATCH /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Assessments
- `GET /api/assessments` - List assessments
- `GET /api/assessments/:id` - Get assessment details
- `POST /api/assessments` - Create assessment
- `PATCH /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

### Bulk Operations
- `POST /api/bulk/delete` - Bulk delete
- `POST /api/bulk/update` - Bulk update

### Audit Trail
- `GET /api/audit` - List audit logs (with filters)
- `GET /api/audit/resource/:resource/:resourceId` - Get resource logs
- `GET /api/audit/user/:userId` - Get user logs

### AI Service
- `POST /api/ai/generate` - Generate content (questions, summaries)

For complete API documentation, see [docs/API.md](./docs/API.md).

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building for Production

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

## 🐳 Docker

Docker Compose ile tüm servisleri tek komutla başlatabilirsiniz:

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Servisleri durdur
docker-compose down

# Servisleri yeniden build et
docker-compose up -d --build

# Sadece frontend'i rebuild et
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Docker Servisleri**:
- `postgres`: PostgreSQL 16 database
- `backend`: Node.js API server (port 3001)
- `frontend`: React frontend (port 3000)

**Önemli**: Docker Compose kullanırken environment variables `docker-compose.yml` dosyasında veya `.env` dosyasında tanımlanmalıdır.

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use functional components with hooks
- Prefer composition over inheritance

### Git Workflow
- Main branch: `main`
- Feature branches: `feature/feature-name`
- Commit messages: Use conventional commits

### Adding New Features
1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Create pull request

## 🔒 Security

- API keys stored server-side only
- JWT tokens with expiration
- Password hashing (bcrypt)
- SQL injection protection (Drizzle ORM)
- XSS protection
- CORS configuration
- Rate limiting for AI endpoints

## 🌍 Internationalization

Supported languages:
- English (en)
- French (fr)
- Turkish (tr)
- German (de)

Language files located in `src/i18n/locales/`

## 📊 Analytics

The analytics dashboard provides:
- Assessment completion rates
- Status distribution
- Package distribution
- Activity trends
- Success rates by package
- Time metrics

## 🐛 Troubleshooting

### Common Issues

**Database connection error**
- Check `DATABASE_URL` in `docker-compose.yml` or `backend/.env`
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Verify database exists: `docker-compose exec postgres psql -U bilan_user -d bilan_easy -c "SELECT current_database();"`

**API errors**
- Check backend server is running: `docker-compose ps backend`
- Verify API URL in frontend: `VITE_API_URL=http://localhost:3001/api`
- Check CORS configuration in `backend/src/app.ts`
- Check backend logs: `docker-compose logs backend`

**Permission errors (admin kullanıcı menüleri göremiyor)**
- Admin kullanıcısının rolünü kontrol et: `docker-compose exec postgres psql -U bilan_user -d bilan_easy -c "SELECT u.email, r.name FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE u.email = 'admin@bilan.com';"`
- Permission'ları kontrol et: `docker-compose exec postgres psql -U bilan_user -d bilan_easy -c "SELECT COUNT(*) FROM role_permissions rp JOIN roles r ON rp.role_id = r.id WHERE r.name = 'admin';"`
- Browser'da logout yapıp tekrar login yapın (permission cache temizlenir)

**Build errors**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (18+): `node --version`
- Docker build cache temizle: `docker-compose build --no-cache frontend`

**Frontend boş beyaz sayfa**
- Browser console'u kontrol et (F12)
- Backend health check: `curl http://localhost:3001/health`
- Frontend logları: `docker-compose logs frontend`
- Detaylı troubleshooting için: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

Daha fazla bilgi için: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) ve [DEBUG_GUIDE.md](./DEBUG_GUIDE.md)

## 📚 Documentation

### For Developers
- **[Quick Start Guide](./docs/DEVELOPER_QUICK_START.md)** - Get started in 5 minutes
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System design and patterns
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Detailed development guides
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute

### For Users
- **[User Guide](./docs/USER_GUIDE.md)** - End-user documentation
- **[Admin Guide](./docs/ADMIN_GUIDE.md)** - Administrator documentation

### Deployment
- **[Deployment Guide](./docs/deployment/DEPLOYMENT.md)** - Production deployment
- **[Environment Setup](./ENV_VARIABLES.md)** - Environment variables reference

### Changelog
- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Version history and changes

## 📄 License

[Add your license here]

## 👥 Team

[Add team information]

## 🙏 Acknowledgments

- **Refine.dev** - Excellent data-driven admin framework
- **Ant Design** - Comprehensive UI component library
- **Hono.js** - Fast and modern web framework
- **Drizzle ORM** - Type-safe database toolkit
- All open-source contributors

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/lekesiz/bilan-final-full/issues)
- **Documentation**: See [docs/](./docs/) directory

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅

---

## 📋 Son Test Raporu

Kapsamlı test raporu için: [COMPREHENSIVE_TEST_REPORT.md](./COMPREHENSIVE_TEST_REPORT.md)

**Test Tarihi**: 2025-11-14  
**Test Durumu**: ✅ %100 BAŞARILI  
**Sistem Durumu**: ✅ PRODUCTION READY

### Test Edilen Özellikler
- ✅ Database bağlantısı ve schema
- ✅ Backend API endpoints
- ✅ Frontend routing ve navigation
- ✅ Authentication ve authorization
- ✅ Permission sistemi (RBAC)
- ✅ Form submission
- ✅ Docker container'lar
- ✅ Environment variables

