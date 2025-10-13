# 🚀 Docker Deployment Guide

This guide provides comprehensive instructions for deploying the WishMaker application using Docker and Docker Compose.

## 🎯 Overview

The WishMaker application uses Docker Compose to orchestrate a multi-container setup including:

- **Frontend**: React application served via Node.js
- **Backend**: Node.js/Express API server
- **Database**: PostgreSQL 16 with initialization scripts
- **Network**: Internal Docker network for service communication

## 📋 Prerequisites

### System Requirements
- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- 4GB+ RAM available for containers
- 2GB+ disk space for images and data

### Development Tools
- Git for repository management
- Node.js (18+) for local development
- PostgreSQL client for database management (optional)

## 🏗️ Container Architecture

```
┌────────────────────────────────────────────┐
│               Docker Network               │
│  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Frontend   │  │      Backend        │  │
│  │  React App  │  │   Express API       │  │
│  │  Port: 3000 │  │    Port: 8000       │  │
│  └─────────────┘  └─────────────────────┘  │
│         │                   │              │
│         └───────────────────┼──────────────┤
│                             │              │
│              ┌─────────────────────────────┤
│              │        Database             │
│              │      PostgreSQL 16          │
│              │       Port: 5432            │
│              └─────────────────────────────┤
└────────────────────────────────────────────┘
```

## 🔧 Configuration Files

### docker-compose.yml
```yaml
version: "3.8"

services:
  frontend:
    build: ./frontend
    container_name: wishmaker-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    networks:
      - wishmaker-network

  backend:
    build: ./backend
    container_name: wishmaker-backend
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - PORT=8000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=wishmaker
      - DB_USER=wishmaker_user
      - DB_PASSWORD=secure_password
    networks:
      - wishmaker-network

  postgres:
    image: postgres:16-alpine
    container_name: wishmaker-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=wishmaker
      - POSTGRES_USER=wishmaker_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wishmaker_user -d wishmaker"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - wishmaker-network

volumes:
  postgres_data:

networks:
  wishmaker-network:
    driver: bridge
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci && npm rebuild bcrypt

# Copy application code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Install serve to serve the built app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]
```

## 🚀 Deployment Process

### 1. Quick Start (Recommended)
```bash
# Clone repository
git clone https://github.com/romcar/WishMaker.git
cd WishMaker

# Start all services
docker-compose up -d

# Verify deployment
docker-compose ps
```

### 2. Step-by-Step Deployment

#### Clone and Setup
```bash
git clone https://github.com/romcar/WishMaker.git
cd WishMaker
```

#### Environment Configuration
```bash
# Create .env file for environment variables
cp .env.example .env
# Edit .env with your configuration
```

#### Build and Start Services
```bash
# Build all images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

#### Verify Deployment
```bash
# Check service status
docker-compose ps

# Test backend health
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000
```

### 3. Production Deployment

#### Security Configuration
```bash
# Generate secure passwords
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 64)

# Update docker-compose.yml with secure credentials
```

#### SSL/TLS Setup (Production)
```yaml
# Add reverse proxy (nginx) configuration
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
```

#### Environment Variables
```bash
# Production environment variables
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=wishmaker
DB_USER=wishmaker_user
DB_PASSWORD=${SECURE_DB_PASSWORD}
JWT_SECRET=${SECURE_JWT_SECRET}
JWT_REFRESH_SECRET=${SECURE_REFRESH_SECRET}
```

## 🔍 Monitoring & Debugging

### Service Health Checks
```bash
# Check all services
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Database Management
```bash
# Connect to database
docker-compose exec postgres psql -U wishmaker_user -d wishmaker

# View database logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U wishmaker_user wishmaker > backup.sql
```

### Container Management
```bash
# Restart specific service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build backend
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Error: Port already in use
# Solution: Stop conflicting services or change ports
docker-compose down
# Or modify ports in docker-compose.yml
```

#### 2. Database Connection Issues
```bash
# Check database container health
docker-compose ps postgres

# View database initialization logs
docker-compose logs postgres

# Test database connectivity
docker-compose exec backend nc -zv postgres 5432
```

#### 3. Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -f backend/Dockerfile backend/
```

#### 4. Memory/Resource Issues
```bash
# Check Docker resources
docker stats

# Increase Docker memory allocation
# Docker Desktop -> Settings -> Resources -> Memory
```

### Performance Optimization

#### Database Performance
```sql
-- Add database indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_wishes_user_id ON wishes(user_id);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
```

#### Container Optimization
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]
```

## 📊 Monitoring Setup

### Health Check Endpoints
```typescript
// Backend health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
});
```

### Log Management
```yaml
# docker-compose.yml logging configuration
services:
  backend:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### Metrics Collection
```bash
# Add monitoring containers
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart services
docker-compose build
docker-compose up -d

# Verify update
docker-compose ps
```

### Database Migrations
```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Backup before major updates
docker-compose exec postgres pg_dump -U wishmaker_user wishmaker > backup_$(date +%Y%m%d).sql
```

### Regular Maintenance
```bash
# Clean unused Docker resources (weekly)
docker system prune

# Update base images (monthly)
docker-compose pull
docker-compose build --no-cache

# Database maintenance (monthly)
docker-compose exec postgres vacuumdb -U wishmaker_user wishmaker
```

## 🎫 Related Linear Tickets

- **[ROM-11](https://linear.app/romcar/issue/ROM-11/)** - DevOps setup and deployment automation
- **[ROM-8](https://linear.app/romcar/issue/ROM-8/)** - Database optimization and performance improvements
- **[ROM-5](https://linear.app/romcar/issue/ROM-5/)** - Security vulnerabilities and authentication (production security)

## 📝 Next Steps

### Planned Improvements
- [ ] Add CI/CD pipeline integration
- [ ] Implement production monitoring stack
- [ ] Add automated backup system
- [ ] Create staging environment configuration
- [ ] Implement blue-green deployment strategy
- [ ] Add container security scanning
- [ ] Set up log aggregation and analysis

---

**Last Updated**: October 12, 2025
**Deployment Status**: ✅ Working in Development
**Production Ready**: 🔄 In Progress (ROM-11)