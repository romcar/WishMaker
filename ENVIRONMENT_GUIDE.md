# Environment Configuration Guide

## Overview

This project uses a structured environment configuration system that separates concerns between development, production, and local environments. This guide explains how to set up and use the environment files.

## File Structure

```
├── .env.development              # Root development config (shared)
├── .env.production               # Root production config (shared)
├── .env.local.example           # Root local overrides template
├── .env.local                   # Root local overrides (git-ignored)
├── backend/
│   ├── .env.development         # Backend development config
│   ├── .env.production          # Backend production config
│   ├── .env.local.example       # Backend local template
│   └── .env.local               # Backend local overrides (git-ignored)
└── frontend/
    ├── .env.development         # Frontend development config
    ├── .env.production          # Frontend production config
    ├── .env.local.example       # Frontend local template
    └── .env.local               # Frontend local overrides (git-ignored)
```

## Environment Loading Order

Environment variables are loaded in this order (last one wins):

1. **Base environment files** (`.env.development` or `.env.production`)
2. **Component-specific files** (`backend/.env.development` or `frontend/.env.development`)
3. **Local overrides** (`.env.local` files - highest priority)

## Setup Instructions

### 1. Development Setup (First Time)

```bash
# Copy template files to create local overrides
cp .env.local.example .env.local
cp backend/.env.local.example backend/.env.local
cp frontend/.env.local.example frontend/.env.local

# Edit the .env.local files to customize for your local environment
# Example: Add your personal Neon database URL, Stack Auth keys, etc.
```

### 2. Production Deployment

```bash
# Edit production files with actual production values
# .env.production - shared production config
# backend/.env.production - backend production config
# frontend/.env.production - frontend production config

# Set NODE_ENV=production in your deployment environment
export NODE_ENV=production
```

## Key Environment Variables

### Shared Variables (Root Level)

| Variable                            | Development    | Production      | Description        |
| ----------------------------------- | -------------- | --------------- | ------------------ |
| `NODE_ENV`                          | development    | production      | Environment mode   |
| `VITE_STACK_PROJECT_ID`             | dev-project-id | prod-project-id | Stack Auth project |
| `VITE_STACK_PUBLISHABLE_CLIENT_KEY` | dev-key        | prod-key        | Stack Auth key     |
| `VITE_NEON_DATABASE_URL`            | placeholder    | real-url        | Neon database URL  |

### Backend Variables

| Variable               | Development | Production         | Description     |
| ---------------------- | ----------- | ------------------ | --------------- |
| `PORT`                 | 8000        | 8000               | Server port     |
| `DB_HOST`              | postgres    | prod-host          | Database host   |
| `JWT_SECRET`           | dev-secret  | secure-prod-secret | JWT signing key |
| `RATE_LIMIT_WINDOW_MS` | 900000      | 300000             | Rate limiting   |

### Frontend Variables

| Variable         | Development           | Production             | Description     |
| ---------------- | --------------------- | ---------------------- | --------------- |
| `VITE_API_URL`   | http://localhost:8000 | https://api.domain.com | Backend API URL |
| `VITE_SITE_URL`  | http://localhost:3000 | https://domain.com     | Frontend URL    |
| `VITE_DEMO_MODE` | false                 | false                  | Demo mode flag  |

## Docker Compose Integration

The `docker-compose.yml` automatically loads environment files:

```yaml
env_file:
  - .env.development     # Base development config
  - .env.local          # Local overrides
```

## Scripts and Commands

### Package.json Scripts

```bash
# Check environment variable loading
npm run env:check

# Database operations (uses environment config)
npm run db:push
npm run db:generate
npm run db:migrate
npm run db:studio
```

### Environment-Specific Commands

```bash
# Development (default)
docker-compose up -d

# Production
NODE_ENV=production docker-compose -f docker-compose.prod.yml up -d
```

## Security Best Practices

### ✅ Safe to Commit
- `.env.development` - Development defaults
- `.env.production` - Production templates (with placeholder values)
- `.env.*.example` - Templates for local overrides

### ❌ Never Commit
- `.env.local` - Contains personal/sensitive overrides
- `.env.*.local` - Local environment specific files
- Any file with real passwords, API keys, or secrets

### Production Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Use strong, randomly generated JWT secrets (64+ characters)
- [ ] Configure proper CORS origins
- [ ] Set restrictive rate limits
- [ ] Use HTTPS URLs for all external services
- [ ] Enable proper logging and monitoring

## Troubleshooting

### Common Issues

1. **Variables not loading**: Check file order and naming
2. **Docker not seeing changes**: Rebuild containers after env changes
3. **Missing variables**: Check if file exists and has correct syntax

### Debugging Commands

```bash
# Check which environment files exist
find . -name ".env*" -type f

# Verify environment loading in Node.js
node -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"

# Check Docker environment
docker-compose config
```

## Migration from Old Structure

The old `.env` files are being phased out:

```bash
# Old structure (deprecated)
.env                    → .env.development
.env.local             → .env.local (restructured)
frontend/.env          → frontend/.env.development
backend/.env           → backend/.env.development
```

Legacy files are kept temporarily for backward compatibility but should be migrated to the new structure.

## Examples

### Local Development Override

**`.env.local`** (your personal settings):
```bash
# My personal Neon database for testing
VITE_NEON_DATABASE_URL=postgresql://myuser:mypass@my-endpoint.neon.tech/mydb

# My Stack Auth project for development
VITE_STACK_PROJECT_ID=my-dev-project-id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=my-dev-key

# Enable debug mode
DEBUG=true
```

### Production Configuration

**`.env.production`** (production template):
```bash
NODE_ENV=production
VITE_API_URL=https://api.wishmaker.com
VITE_NEON_DATABASE_URL=postgresql://prod-user:SECURE-PASSWORD@prod.neon.tech/wishmaker
JWT_SECRET=CHANGE-THIS-TO-SECURE-64-CHAR-RANDOM-STRING
```

This structure provides clear separation of concerns, proper security, and easy environment management.