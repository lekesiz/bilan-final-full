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
- **React 19** with TypeScript
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

#### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001/api
VITE_BACKEND_AI_URL=http://localhost:3001/api/ai
```

#### Backend (backend/.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bilan_db

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# AI Providers (at least one required)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GEMINI_API_KEY=your-gemini-key

# Rate Limiting
AI_RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW=60000
```

### 4. Database Setup

```bash
# Run migrations (if using Drizzle migrations)
cd backend
npm run db:migrate

# Or create database manually
createdb bilan_db
```

### 5. Start Development Servers

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

## 🐳 Docker (Optional)

```bash
# Start with Docker Compose
docker-compose up -d
```

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
- Check DATABASE_URL in backend/.env
- Ensure PostgreSQL is running
- Verify database exists

**API errors**
- Check backend server is running
- Verify API URL in frontend .env.local
- Check CORS configuration

**Build errors**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed

## 📚 Additional Documentation

- [API Documentation](./docs/API.md) (if exists)
- [Deployment Guide](./docs/DEPLOYMENT.md) (if exists)
- [Contributing Guide](./CONTRIBUTING.md) (if exists)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

[Add your license here]

## 👥 Authors

[Add authors/team information]

## 🙏 Acknowledgments

- Refine.dev team for the excellent framework
- Ant Design for the UI components
- All open-source contributors

---

**Last Updated**: November 2024
**Version**: 1.0.0
