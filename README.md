# Lunch-DeepSeek

# Amazing Lunch Indicator - Sprint 1 Prototype

## Overview
This prototype implements the foundation and registration requirements for Sprint 1 of the Amazing Lunch Indicator project.

### Implemented Requirements
- ✅ FR1: Download mobile application (simulated)
- ✅ FR3: User registration - Mobile application
- ✅ FR22: Create an account (Restaurant Owner)
- ✅ QR10: Hard drive space constraint (20MB max)
- ✅ QR11: Application memory usage (20MB max)
- ✅ QR17: User create account security
- ✅ QR18: Restaurant owner create account security
- ✅ QR22: Internet connection check

## Prerequisites
- Docker and Docker Compose
- Git
- Node.js (optional, for local development)
- Python 3.11+ (optional, for local development)

## Quick Start

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd amazing-lunch-indicator
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values (or use defaults for development)
```

### 3. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Applications
- **Web Portal**: http://localhost
- **Mobile Prototype**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Database**: localhost:5432 (credentials in .env)

### 5. Verify Deployment
```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Test API health
curl http://localhost:8000/health
```
