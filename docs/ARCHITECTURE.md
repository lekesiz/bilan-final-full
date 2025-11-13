# Architecture Documentation

## System Overview

BILAN-EASY is a full-stack web application following a modern, scalable architecture pattern.

## Architecture Pattern

**Frontend-Backend Separation** with RESTful API communication.

```
┌─────────────────┐         ┌─────────────────┐
│   React Frontend │ ◄─────► │  Node.js Backend │
│   (Port 3000)    │  HTTP   │   (Port 3001)   │
└─────────────────┘         └────────┬──────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │   Database   │
                              └──────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 19** - UI library
- **TypeScript** - Type safety
- **Refine.dev** - Data-driven admin framework
- **Ant Design** - UI components
- **React Router v7** - Routing
- **React Query** - Data fetching/caching
- **Tailwind CSS** - Styling

### Key Patterns

#### Component Structure
```
pages/              # Page-level components
components/         # Shared UI components
src/core/
  ├── components/   # Reusable business components
  ├── layout/       # Layout components
  └── permissions/  # RBAC components
```

#### State Management
- **Server State**: React Query (TanStack Query)
- **Local State**: React hooks (useState, useReducer)
- **Form State**: Ant Design Form
- **Global State**: Context API (minimal usage)

#### Data Flow
```
User Action → Component → API Client → Backend API → Database
                ↓
         React Query Cache
                ↓
         Component Re-render
```

## Backend Architecture

### Technology Stack
- **Node.js** - Runtime
- **TypeScript** - Type safety
- **Hono.js** - Web framework
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

### Key Patterns

#### Layered Architecture
```
Routes (HTTP Layer)
    ↓
Middleware (Auth, Validation)
    ↓
Services (Business Logic)
    ↓
Database (Data Layer)
```

#### Route Structure
```
/api/
  ├── auth/          # Authentication
  ├── users/         # User management
  ├── roles/         # Role management
  ├── assessments/   # Assessment CRUD
  ├── bulk/          # Bulk operations
  ├── audit/         # Audit trail
  └── ai/            # AI service proxy
```

#### Service Layer
- **Business Logic**: Services handle all business rules
- **Data Access**: Drizzle ORM for database operations
- **External APIs**: AI service integration

## Database Schema

### Core Tables
- `users` - User accounts
- `roles` - User roles
- `permissions` - Granular permissions
- `user_roles` - User-role mapping
- `role_permissions` - Role-permission mapping
- `assessments` - Assessment records
- `audit_logs` - Activity logs

### Relationships
```
users ←→ user_roles ←→ roles ←→ role_permissions ←→ permissions
users ←→ assessments
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Backend validates and generates JWT
3. Frontend stores token
4. Token included in subsequent requests
5. Backend validates token on each request
```

### Authorization Flow
```
1. Request arrives with JWT
2. Extract user ID from token
3. Fetch user roles and permissions
4. Check permission for requested resource:action
5. Allow or deny request
```

### Security Measures
- Password hashing (bcrypt)
- JWT token expiration
- API key protection (server-side only)
- SQL injection prevention (ORM)
- XSS protection
- CORS configuration
- Rate limiting

## AI Service Architecture

### Multi-Provider Pattern
```
Request → AI Service Router
            ├─► OpenAI (Primary)
            ├─► Claude (Fallback 1)
            └─► Gemini (Fallback 2)
```

### Features
- Automatic fallback on failure
- Rate limiting per provider
- Request coalescing
- Error handling and retries

## Deployment Architecture

### Development
- Frontend: Vite dev server
- Backend: Node.js with nodemon
- Database: Local PostgreSQL

### Production (Recommended)
- Frontend: Static files (Nginx/CDN)
- Backend: Node.js (PM2/Docker)
- Database: Managed PostgreSQL
- Reverse Proxy: Nginx

## Performance Considerations

### Frontend
- Code splitting with Vite
- React Query caching
- Lazy loading routes
- Image optimization

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching strategies

## Scalability

### Horizontal Scaling
- Stateless backend (JWT-based)
- Database connection pooling
- Load balancer ready

### Vertical Scaling
- Efficient database queries
- Optimized React rendering
- Memory management

## Monitoring & Logging

### Logging
- Structured logging (backend)
- Error tracking
- Audit trail system

### Monitoring (Future)
- Application metrics
- Performance monitoring
- Error tracking (Sentry ready)

