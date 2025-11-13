# Contributing to BILAN-EASY

Thank you for your interest in contributing to BILAN-EASY! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/your-username/bilan-final-full.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes**
5. **Test your changes**: `npm test && npm run test:e2e`
6. **Commit**: Use conventional commits (see below)
7. **Push**: `git push origin feature/your-feature-name`
8. **Create a Pull Request**

## 📝 Code Style

### TypeScript
- Use TypeScript strict mode
- Define types for all props and functions
- Avoid `any` - use `unknown` if needed

### React
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use meaningful component and variable names

### File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

### Code Formatting
- Use ESLint rules (already configured)
- Format with Prettier (if configured)
- 2 spaces for indentation

## 🔀 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/component-name` - Refactoring

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add export functionality
fix: Resolve authentication token expiration
docs: Update API documentation
refactor: Simplify user service
test: Add tests for bulk operations
chore: Update dependencies
```

### Pull Request Process

1. **Title**: Clear, descriptive title
2. **Description**: 
   - What changes were made
   - Why they were made
   - How to test
3. **Checklist**:
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No console.logs in production code
   - [ ] i18n keys added for new strings

## 🧪 Testing

### Unit Tests
- Test business logic
- Test utility functions
- Test hooks

### Integration Tests
- Test API endpoints
- Test database operations
- Test service layer

### E2E Tests
- Test critical user flows
- Test authentication
- Test CRUD operations

## 📚 Documentation

### Code Comments
- Explain "why", not "what"
- Use JSDoc for functions
- Document complex logic

### README Updates
- Update README.md for new features
- Update API.md for new endpoints
- Update ARCHITECTURE.md for structural changes

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables
- Validate all user inputs
- Follow OWASP guidelines

## 🐛 Reporting Bugs

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 💡 Suggesting Features

Use GitHub Issues with:
- Clear description
- Use case
- Proposed solution
- Alternatives considered

## 📞 Questions?

- Open a GitHub Discussion
- Check existing documentation
- Review code examples

Thank you for contributing! 🎉

