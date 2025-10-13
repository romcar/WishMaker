# 📚 WishMaker Documentation

Welcome to the comprehensive documentation for the WishMaker application. This documentation is organized into different sections to help developers, contributors, and users understand and work with the application effectively.

## 📖 Table of Contents

### 🏗️ Project Overview
- [Main README](../README.md) - Project overview, features, and quick start guide
- [Authentication System](./authentication.md) - Complete authentication implementation guide
- [Linear Integration](./linear-integration.md) - Project management and ticket tracking

### 🎨 Frontend Documentation
- [Frontend Setup](./frontend/frontend-setup.md) - React application setup and development
- [Web Vitals Guide](./frontend/web-vitals-guide.md) - Performance monitoring and optimization
- [Authentication Components](./frontend/authentication-components.md) - Login, Register, and Protected Routes

### 🔧 Development
- [Development Environment](./development/development-setup.md) - Local development setup guide
- [Test Environment](./development/test-environment.md) - Testing tools and environment configuration
- [Codacy Instructions](./development/codacy-instructions.md) - Code quality and analysis guidelines
- [Docker Development](./development/docker-development.md) - Docker-based development workflow

### 🔷 TypeScript Types
- [Types Documentation](./types/README.md) - Comprehensive TypeScript type reference
  - [🔐 Authentication Types](./types/authentication-types.md) - User auth, sessions, WebAuthn, MFA
  - [🎯 Wish Types](./types/wish-types.md) - Wish management, categories, priorities, filtering
  - [🔑 WebAuthn Types](./types/webauthn-types.md) - Passwordless authentication, security keys
  - [🎨 Component Types](./types/component-types.md) - React component props, state, event handlers
  - [🌐 API Types](./types/api-types.md) - HTTP requests, responses, API clients

### 🚀 Deployment
- [Docker Deployment](./deployment/docker-deployment.md) - Production deployment with Docker Compose
- [Environment Configuration](./deployment/environment-config.md) - Environment variables and configuration
- [Database Setup](./deployment/database-setup.md) - PostgreSQL database configuration

### 🔐 Security
- [Authentication Security](./security/authentication-security.md) - Security best practices for authentication
- [WebAuthn Implementation](./security/webauthn.md) - Passwordless authentication setup
- [Security Checklist](./security/security-checklist.md) - Comprehensive security guidelines

### 🧪 Testing
- [Testing Strategy](./testing/testing-strategy.md) - Comprehensive testing approach
- [Unit Testing](./testing/unit-testing.md) - Backend and frontend unit testing
- [Integration Testing](./testing/integration-testing.md) - API and database testing
- [E2E Testing](./testing/e2e-testing.md) - End-to-end testing with authentication flows

### 📊 Monitoring & Performance
- [Performance Monitoring](./monitoring/performance-monitoring.md) - Web Vitals and performance tracking
- [Error Tracking](./monitoring/error-tracking.md) - Error monitoring and debugging
- [Health Checks](./monitoring/health-checks.md) - System health monitoring

## 🎫 Linear Tickets Integration

All documentation improvements and development tasks are tracked through Linear tickets:

- **[ROM-5](https://linear.app/romcar/issue/ROM-5/)** - Security vulnerabilities and authentication
- **[ROM-6](https://linear.app/romcar/issue/ROM-6/)** - Authentication features and user management
- **[ROM-7](https://linear.app/romcar/issue/ROM-7/)** - Frontend enhancements and user experience
- **[ROM-8](https://linear.app/romcar/issue/ROM-8/)** - Database optimization and performance
- **[ROM-9](https://linear.app/romcar/issue/ROM-9/)** - API improvements and developer experience
- **[ROM-10](https://linear.app/romcar/issue/ROM-10/)** - Testing infrastructure implementation
- **[ROM-11](https://linear.app/romcar/issue/ROM-11/)** - DevOps setup and deployment automation

## 🚀 Quick Start

1. **Development Setup**: Start with [Development Environment](./development/development-setup.md)
2. **Docker Deployment**: Use [Docker Deployment](./deployment/docker-deployment.md) for full-stack setup
3. **Frontend Development**: Check [Frontend Setup](./frontend/frontend-setup.md)
4. **Authentication**: Review [Authentication System](./authentication.md)

## 🤝 Contributing

When adding new documentation:

1. Follow the existing structure and naming conventions
2. Add appropriate Linear ticket references
3. Update this main README with new document links
4. Ensure all TODO items reference Linear tickets
5. Include code examples and implementation guidance

## 📋 Documentation Status

### ✅ Completed
- [x] Frontend documentation migration
- [x] Development environment documentation
- [x] Code quality guidelines (Codacy)
- [x] Basic project structure documentation

### 🔄 In Progress
- [ ] Authentication system documentation (ROM-5, ROM-6)
- [ ] Deployment guides (ROM-11)
- [ ] Testing documentation (ROM-10)
- [ ] Security guidelines (ROM-5)

### 📝 Planned
- [ ] API documentation (ROM-9)
- [ ] Performance optimization guides (ROM-8)
- [ ] Monitoring and logging setup (ROM-11)
- [ ] User experience guidelines (ROM-7)

---

**Last Updated**: October 12, 2025
**Version**: 1.0.0
**Maintained By**: WishMaker Development Team