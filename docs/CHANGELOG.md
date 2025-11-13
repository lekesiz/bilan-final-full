# Changelog

All notable changes to BILAN-EASY will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-13

### Added
- **Export Functionality**: CSV, Excel, and PDF export for all list pages
- **Advanced Search & Filters**: Multi-criteria filtering with date ranges, status, and custom filters
- **Bulk Operations**: Bulk delete, update, and activate/deactivate for users, roles, and assessments
- **Audit Trail System**: Complete activity logging with filtering and detailed views
- **User Profile Page**: User information display with role management
- **Settings Page**: User preferences (language, theme, timezone, notifications, privacy)
- **Quick Wins UX Improvements**:
  - Confirmation modals for delete operations
  - Loading skeletons for tables
  - Context-aware empty states
  - Keyboard shortcuts modal (Ctrl+/)
  - Tooltips for form fields
- **Internationalization**: Full i18n support for 4 languages (EN, FR, TR, DE)
- **Analytics Dashboard**: Enhanced with new metrics and visualizations
- **Backend AI Service**: Secure AI proxy with multi-provider support (OpenAI, Claude, Gemini)
- **Production-Safe Logging**: Custom logger utility, console.log cleanup

### Changed
- **Security**: Removed `dangerouslyAllowBrowser` from frontend AI providers
- **AI Service**: Migrated to backend proxy for secure API key management
- **Dependencies**: Updated to latest stable versions
- **Documentation**: Complete rewrite with developer-friendly structure

### Fixed
- Dashboard content visibility issues
- Permission guard coverage for all CRUD operations
- TypeScript strict mode compliance
- Build warnings and errors

### Security
- API keys now stored server-side only
- JWT token validation
- SQL injection prevention (ORM)
- XSS protection
- CORS configuration

## [0.9.0] - 2024-11-01

### Added
- Initial dashboard integration with Refine.dev
- RBAC system implementation
- User and role management
- Assessment CRUD operations

## [0.8.0] - 2024-10-15

### Added
- Multi-provider AI support
- Backend API with Hono.js
- PostgreSQL database integration
- Docker Compose setup

## [0.7.0] - 2024-09-20

### Added
- Initial BILAN assessment module
- AI-powered question generation
- PDF export functionality
- Session recovery

---

[Unreleased]: https://github.com/lekesiz/bilan-final-full/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/lekesiz/bilan-final-full/releases/tag/v1.0.0

