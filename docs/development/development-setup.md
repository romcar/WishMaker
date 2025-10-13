# 🛠️ Development Environment Setup

This guide provides comprehensive instructions for setting up a local development environment for the WishMaker application.

## 🎯 Overview

The WishMaker development environment supports both Docker-based and native development workflows, with comprehensive tooling for debugging, testing, and code quality.

## 📋 Prerequisites

### Required Software
- **Node.js** (18.0 or later)
- **npm** (9.0 or later) or **yarn** (1.22 or later)
- **Git** (2.30 or later)
- **PostgreSQL** (15+ for native development)
- **Docker Desktop** (for containerized development)

### Recommended Tools
- **Visual Studio Code** with recommended extensions
- **PostgreSQL client** (pgAdmin, DBeaver, or command line tools)
- **Postman** or **Insomnia** for API testing
- **GitHub CLI** for repository management

## 🚀 Quick Start

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/romcar/WishMaker.git
cd WishMaker

# Install dependencies for both frontend and backend
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration files with your settings
```

### 3. Choose Development Method

#### Option A: Docker Development (Recommended)
```bash
# Start all services with Docker
docker-compose up -d

# Access services:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432
```

#### Option B: Native Development
```bash
# Start PostgreSQL database
docker-compose up postgres -d

# Start backend development server
cd backend
npm run dev

# Start frontend development server (in new terminal)
cd frontend
npm start
```

## 🏗️ Development Workflow

### Project Structure
```
WishMaker/
├── docs/                   # Documentation
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── db/             # Database configuration
│   └── package.json
├── docker-compose.yml      # Container orchestration
└── README.md
```

### Development Scripts

#### Root Level Scripts
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build all projects
npm run build:all

# Run all tests
npm run test:all

# Lint all code
npm run lint:all
```

#### Frontend Scripts
```bash
cd frontend

# Development server with hot reload
npm start

# Build production version
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

#### Backend Scripts
```bash
cd backend

# Development server with auto-restart
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Database migrations
npm run migrate

# Database seeding
npm run seed
```

## 🔧 IDE Configuration

### Visual Studio Code Setup

#### Recommended Extensions
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode-remote.remote-containers",
    "GitHub.copilot",
    "ms-playwright.playwright"
  ]
}
```

#### Workspace Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

#### Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Launch Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    }
  ]
}
```

## 🗄️ Database Setup

### Local PostgreSQL Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create development database
createdb wishmaker_dev
psql wishmaker_dev -f backend/src/db/init.sql
```

### Docker Database Setup
```bash
# Start only the database service
docker-compose up postgres -d

# Connect to database
docker-compose exec postgres psql -U wishmaker_user -d wishmaker

# Run migrations
cd backend && npm run migrate
```

### Database Configuration
```typescript
// backend/src/db/pool.ts
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'wishmaker_dev',
  user: process.env.DB_USER || 'wishmaker_user',
  password: process.env.DB_PASSWORD || 'development_password',
});
```

## 🧪 Testing Setup

### Frontend Testing
```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### Backend Testing
```bash
cd backend

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage
```

### Test Configuration
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## 🔍 Code Quality Tools

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### Husky Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

## 🔐 Environment Variables

### Backend Environment (.env)
```bash
# Server Configuration
NODE_ENV=development
PORT=8000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wishmaker_dev
DB_USER=wishmaker_user
DB_PASSWORD=development_password

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebAuthn
WEBAUTHN_RP_NAME=WishMaker
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000
```

### Frontend Environment (.env)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=10000

# Feature Flags
REACT_APP_ENABLE_WEBAUTHN=true
REACT_APP_ENABLE_MFA=true
REACT_APP_ENABLE_DEV_TOOLS=true

# Development
REACT_APP_DEBUG_MODE=true
GENERATE_SOURCEMAP=true
```

## 🚀 Hot Reload & Development Features

### Backend Hot Reload (Nodemon)
```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts,js",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/index.ts"
}
```

### Frontend Development Features
- **Hot Module Replacement (HMR)** for instant component updates
- **Source maps** for debugging compiled TypeScript
- **Proxy configuration** for API calls during development
- **Error overlay** showing compilation and runtime errors

## 📊 Development Tools Integration

### API Documentation
```bash
# Generate API documentation
cd backend
npm run docs:generate

# Serve documentation locally
npm run docs:serve
```

### Database Tools
```bash
# Database migrations
npm run migrate:up
npm run migrate:down
npm run migrate:create migration_name

# Database seeding
npm run seed:run
npm run seed:create seed_name
```

### Performance Monitoring
```typescript
// Development performance monitoring
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${duration}ms`);
    });
    next();
  });
}
```

## 🛠️ Troubleshooting

### Common Development Issues

#### Port Conflicts
```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@15

# Check Docker container
docker-compose ps postgres
```

#### Node.js Version Issues
```bash
# Use Node Version Manager
nvm install 18
nvm use 18

# Verify version
node --version
npm --version
```

#### Module Resolution Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Issues
```bash
# Check system resources
top
docker stats

# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 🎫 Related Linear Tickets

- **[ROM-10](https://linear.app/romcar/issue/ROM-10/)** - Testing infrastructure implementation
- **[ROM-9](https://linear.app/romcar/issue/ROM-9/)** - API improvements and developer experience
- **[ROM-11](https://linear.app/romcar/issue/ROM-11/)** - DevOps setup and deployment automation

## 📝 Next Steps

### Development Enhancements
- [ ] Add Storybook for component development
- [ ] Implement TypeScript strict mode
- [ ] Add automated dependency updates
- [ ] Set up development analytics
- [ ] Create development documentation templates
- [ ] Add performance profiling tools

---

**Last Updated**: October 12, 2025
**Development Status**: ✅ Ready for Development
**Docker Support**: ✅ Full Docker Development Environment