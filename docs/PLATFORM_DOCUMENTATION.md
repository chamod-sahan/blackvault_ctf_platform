# BlackVault CTF Platform
## Complete Technical Documentation

**Version:** 1.0.0 | **Last Updated:** April 2026 | **Classification:** Internal Developer Reference

---

# Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Security Architecture](#7-security-architecture)
8. [Running with Docker](#8-running-with-docker)
9. [Running without Docker (Local Dev)](#9-running-without-docker-local-dev)
10. [Production Hosting on Linux Server](#10-production-hosting-on-linux-server)
11. [Nginx Configuration & SSL](#11-nginx-configuration--ssl)
12. [Environment Variables Reference](#12-environment-variables-reference)
13. [Default Credentials & Seeding](#13-default-credentials--seeding)
14. [Admin Panel Guide](#14-admin-panel-guide)
15. [Real-time Features (Socket.io)](#15-real-time-features-socketio)
16. [Performance & Caching](#16-performance--caching)
17. [Terraform & CI/CD](#17-terraform--cicd)
18. [Troubleshooting](#18-troubleshooting)
19. [Future Enhancements & Roadmap](#19-future-enhancements--roadmap)

---

# 1. Platform Overview

BlackVault is a **multi-user Capture The Flag (CTF)** cybersecurity training platform engineered in the spirit of Hack The Box. It provides a full hacking simulation environment where participants can sharpen their offensive and defensive security skills through structured challenges, hands-on machines, learning paths, and academy modules.

## Core Capabilities

| Capability | Description |
|---|---|
| **Challenge System** | Multi-category challenges: Web, Pwn, Crypto, Forensics, Reverse Engineering |
| **Machine Labs** | Full VM-style machine challenges (Windows & Linux) |
| **Academy Modules** | Standalone educational content with quizzes |
| **Learning Paths** | Curated guided roadmaps through skill areas |
| **Team System** | Create/join squads, collaborate on challenges |
| **Live Leaderboards** | Real-time user and team rankings |
| **Admin Panel** | Full CRUD management for challenges, users, CTF events |
| **CTF Events** | Timed competitive events with team/solo registration |
| **Flag Submission** | Secure, rate-limited flag validation engine |

## Target Audience

- Cybersecurity students and enthusiasts
- University cybersecurity clubs and programs
- Corporate red team training programs
- Competitive CTF teams

---

# 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       NGINX REVERSE PROXY                       │
│              (Port 80 / 443 — SSL Termination)                  │
│  /          → Frontend (Next.js :3000)                          │
│  /api/*     → Backend  (Express  :4000)                         │
│  /socket.io → Backend  (Socket.io WebSocket)                    │
│  /uploads/* → Static File Serving                               │
└────────────┬─────────────────────────────┬──────────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐   ┌─────────────────────────────────────┐
│  FRONTEND (Next.js 14) │   │     BACKEND (Node.js + Express)     │
│  App Router / React 18 │   │  Prisma ORM  │  Socket.io  │  JWT   │
│  Zustand / Axios       │   │  Zod Validation  │  bcrypt          │
│  TailwindCSS           │   │  Multer (uploads) │  Rate Limiting  │
└────────────────────────┘   └───────────┬─────────────┬───────────┘
                                         │             │
                          ┌──────────────┘             └──────────────┐
                          ▼                                           ▼
            ┌─────────────────────────┐               ┌──────────────────────┐
            │   MySQL 8.0 Database    │               │   Redis 7 Cache      │
            │  (Prisma managed ORM)   │               │  (Session / Rate     │
            │  Persistent Volume      │               │   Limit / Leaderboard│
            └─────────────────────────┘               └──────────────────────┘
```

---

# 3. Technology Stack

## 3.1 Frontend

| Package | Version | Purpose |
|---|---|---|
| Next.js | 14.1.0 | React Framework with App Router |
| React | 18.2.0 | UI Component Library |
| TypeScript | 5.3.3 | Static Type Safety |
| TailwindCSS | 3.4.1 | Utility-First Styling |
| Zustand | 4.5.0 | Global State Management |
| Axios | 1.6.7 | HTTP Client for API Calls |
| Socket.io-client | 4.7.4 | Real-time WebSocket Communication |
| Lucide React | 0.323.0 | Icon Library |
| clsx | 2.1.0 | Conditional ClassName Utility |

## 3.2 Backend

| Package | Version | Purpose |
|---|---|---|
| Node.js | ≥20.0 | JavaScript Runtime |
| Express | 4.18.2 | HTTP Server Framework |
| TypeScript | 5.3.3 | Static Type Safety |
| Prisma ORM | 5.10.0 | Database Access Layer |
| jsonwebtoken | 9.0.2 | JWT Authentication |
| bcryptjs | 2.4.3 | Password Hashing |
| Socket.io | 4.7.4 | Real-time WebSocket Events |
| ioredis | 5.3.2 | Redis Client |
| express-rate-limit | 7.1.5 | Rate Limiting Middleware |
| zod | 3.22.4 | Request Validation Schemas |
| multer | 1.4.5 | File Upload Handling |
| cookie-parser | 1.4.6 | HTTP Cookie Parsing |
| uuid | 9.0.1 | Unique ID Generation |

## 3.3 Database & Caching

| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.0 | Relational Database (primary store) |
| Prisma | 5.10.0 | ORM & Schema Migrations |
| Redis | 7 (Alpine) | Caching, Rate Limiting, Leaderboard |

## 3.4 Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Container Runtime |
| Docker Compose | Multi-container Orchestration |
| Nginx | Reverse Proxy, SSL Termination, Static Assets |
| Terraform | GitHub Actions CI/CD Secrets & Branch Protection |

---

# 4. Project Structure

```
ctf-platform/
│
├── backend/                          # Express API Server
│   ├── prisma/
│   │   └── schema.prisma             # Full database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts                # Environment variable loader
│   │   │   └── prisma.ts             # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Login, Register, Logout
│   │   │   ├── challengeController.ts
│   │   │   ├── educationController.ts
│   │   │   ├── submissionController.ts
│   │   │   ├── teamController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT auth + role guards
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── challenges.ts
│   │   │   ├── education.ts
│   │   │   ├── teams.ts
│   │   │   └── users.ts
│   │   ├── services/
│   │   │   └── redis.ts              # Redis connection singleton
│   │   ├── types/
│   │   │   └── express.d.ts          # Express Request type extensions
│   │   ├── utils/
│   │   │   └── seed.ts               # Database seeder
│   │   └── server.ts                 # Application entry point
│   ├── .env                          # Local environment config
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                         # Next.js Application
│   ├── app/
│   │   ├── admin/                    # Admin panel pages
│   │   │   ├── users/
│   │   │   ├── challenges/
│   │   │   ├── academy/
│   │   │   └── ctf-events/
│   │   ├── challenges/               # Challenge list + detail
│   │   ├── academy/                  # Standalone modules
│   │   ├── learning-paths/           # Guided roadmaps
│   │   ├── teams/                    # Team management
│   │   ├── leaderboard/              # Live rankings
│   │   ├── dashboard/                # User home
│   │   ├── machines/                 # Machine challenges
│   │   ├── components/               # Shared UI components
│   │   ├── layout.tsx                # Root layout (Navbar, Providers)
│   │   └── globals.css               # Design tokens + utilities
│   ├── lib/
│   │   ├── api/                      # Axios API service wrappers
│   │   └── store/                    # Zustand state stores
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf                    # Main nginx configuration
│   └── conf.d/
│       └── default.conf              # Upstream routing rules
│
├── terraform/
│   ├── main.tf                       # GitHub secrets + branch protection
│   ├── variables.tf
│   └── terraform.tfvars.example
│
├── uploads/                          # Uploaded challenge/module assets
├── database/                         # Additional DB scripts
├── docker-compose.yml                # Full stack orchestration
├── STRUCTURE.md                      # Repository map
└── README.md
```

---

# 5. Database Schema

## 5.1 Core Entities

| Model | Key Fields | Description |
|---|---|---|
| `User` | id, username, email, role, status, points | Platform participant |
| `Challenge` | id, title, category, type, difficulty, flag | Individual task/machine |
| `Submission` | id, userId, challengeId, correct | Flag attempt record |
| `Solve` | id, userId, challengeId, points, solvedAt | Confirmed correct solve |
| `Team` | id, name | Collaborative group |
| `TeamMember` | userId, teamId, role | User-Team join record |

## 5.2 Education Models

| Model | Key Fields | Description |
|---|---|---|
| `LearningPath` | id, title, difficulty | Guided learning roadmap |
| `PathModule` | id, title, content, type, order | Individual roadmap lesson |
| `AcademyModule` | id, title, content, category, type | Standalone lesson |
| `AcademyQuestion` | id, text, answer, hint | Quiz question for a module |

## 5.3 Events & Systems

| Model | Key Fields | Description |
|---|---|---|
| `CtfEvent` | id, title, status, startTime, endTime | Competitive CTF event |
| `CtfRegistration` | eventId, userId/teamId, type | Event signup |
| `SystemSetting` | key, value | Platform configuration KV store |
| `Log` | level, message, source, userId | Application event log |

## 5.4 Enum Types

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN` |
| `UserStatus` | `ACTIVE`, `BANNED`, `TEMP_BANNED` |
| `Difficulty` | `EASY`, `MEDIUM`, `HARD`, `EXPERT` |
| `ChallengeType` | `CHALLENGE`, `MACHINE` |
| `OperatingSystem` | `WINDOWS`, `LINUX`, `OTHER` |
| `ModuleType` | `READING`, `LAB`, `VIDEO` |
| `TeamRole` | `LEADER`, `MEMBER` |
| `RegistrationType` | `SOLO`, `TEAM` |
| `LogLevel` | `INFO`, `WARN`, `ERROR`, `DEBUG` |

---

# 6. API Reference

## 6.1 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Authenticate user, set cookie |
| POST | `/api/auth/logout` | User | Clear auth cookie |
| GET | `/api/auth/me` | User | Get current user profile |

## 6.2 Challenge Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/challenges` | User | List all challenges |
| GET | `/api/challenges/:id` | User | Get challenge details |
| POST | `/api/challenges` | Admin | Create a challenge |
| PUT | `/api/challenges/:id` | Admin | Update a challenge |
| DELETE | `/api/challenges/:id` | Admin | Delete a challenge |
| POST | `/api/challenges/submit` | User | Submit a flag |
| POST | `/api/challenges/:id/upload` | Admin | Upload attachment |

## 6.3 User Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/me` | User | Get own profile |
| GET | `/api/users/leaderboard/users` | Public | User rankings |
| GET | `/api/users/leaderboard/teams` | Public | Team rankings |
| PUT | `/api/users/:id/ban` | Admin | Ban/suspend a user |

## 6.4 Team Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/teams` | User | Create a new team |
| GET | `/api/teams` | User | List all teams |
| GET | `/api/teams/my` | User | Get own team |
| POST | `/api/teams/join` | User | Join team with invite code |
| POST | `/api/teams/leave` | User | Leave current team |

## 6.5 Education Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/education/academy` | User | List academy modules |
| GET | `/api/education/paths` | User | List learning paths |
| POST | `/api/education/academy` | Admin | Create academy module |
| PUT | `/api/education/academy/:id` | Admin | Update academy module |
| DELETE | `/api/education/academy/:id` | Admin | Delete academy module |
| POST | `/api/education/academy/image` | Admin | Upload module image |

## 6.6 Submission Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/submissions/history` | User | User's attempt history |
| GET | `/api/submissions/solves` | User | User's correct solves |

---

# 7. Security Architecture

## 7.1 Authentication Flow

```
1. User submits credentials (email + password)
2. Backend validates via bcrypt.compare()
3. On success: jwt.sign() creates a signed token
4. Token is set as an HttpOnly cookie (XSS-safe)
5. All subsequent requests include the cookie automatically
6. Backend middleware verifies token on every protected route
7. User status (ACTIVE/BANNED/TEMP_BANNED) is checked per-request
```

## 7.2 Security Measures

| Measure | Implementation |
|---|---|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **JWT Tokens** | HS256 signing, 7-day expiry, HttpOnly cookies |
| **Rate Limiting** | `express-rate-limit` on flag submission endpoints |
| **Input Validation** | Zod schemas on all POST/PUT request bodies |
| **SQL Injection** | Prevented entirely via Prisma parameterized queries |
| **XSS Protection** | React's built-in JSX escaping on the frontend |
| **CORS Policy** | Strict origin whitelist (FRONTEND_URL env variable) |
| **Role Guards** | `authenticate` + `requireAdmin` middleware chain |
| **Ban System** | Permanent and temporary ban support with auto-lift |
| **Maintenance Mode** | System setting KV store gates all non-admin access |

---

# 8. Running with Docker

Docker is the **recommended** way to run the full platform. All services are defined in `docker-compose.yml`.

## 8.1 Prerequisites

| Requirement | Version |
|---|---|
| Docker Desktop / Docker Engine | ≥24.0 |
| Docker Compose | ≥2.0 |
| Git | Any recent version |

## 8.2 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ctf-platform.git
cd ctf-platform

# 2. Create backend environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your values (see Section 12)

# 3. Launch all services in detached mode
docker-compose up -d

# 4. The first startup will automatically:
#    - Pull MySQL 8.0 and Redis 7 images
#    - Build the backend and frontend Docker images
#    - Run: npx prisma generate && npx prisma db push
#    - Start the dev servers

# 5. (Optional) Seed the database with demo data
docker-compose exec backend npm run db:seed
```

## 8.3 Service URLs (Docker)

| Service | URL |
|---|---|
| Frontend (via Nginx) | http://localhost |
| Frontend (direct) | http://localhost:3000 |
| Backend API (direct) | http://localhost:4000 |
| MySQL | localhost:3307 |
| Redis | localhost:6379 |

## 8.4 Docker Compose Services

| Service | Image | Purpose |
|---|---|---|
| `mysql` | mysql:8.0 | Primary relational database |
| `redis` | redis:7-alpine | Caching & rate limiting |
| `backend` | Custom build from `./backend` | Express API server |
| `frontend` | Custom build from `./frontend` | Next.js application |
| `nginx` | nginx:alpine | Reverse proxy & static files |

## 8.5 Useful Docker Commands

```bash
# View live logs from all services
docker-compose logs -f

# View logs from a specific service
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and REMOVE all data (full reset)
docker-compose down -v

# Rebuild images after code changes
docker-compose up -d --build

# Open a shell inside the backend container
docker-compose exec backend sh

# Run Prisma migrations manually
docker-compose exec backend npx prisma db push

# Run database seeder
docker-compose exec backend npm run db:seed

# Check service health status
docker-compose ps
```

## 8.6 Docker Network

All services communicate on an isolated Docker bridge network called `ctf-network`. Containers reference each other by service name (e.g., `mysql`, `redis`, `backend`, `frontend`).

---

# 9. Running without Docker (Local Dev)

> [!NOTE]
> You will need to manually run MySQL and Redis instances. Using Docker just for the databases (and running the app natively) is a good middle-ground.

## 9.1 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥20.0 |
| npm | ≥10.0 |
| MySQL | 8.0 |
| Redis | 7.0 |

## 9.2 Option A: Databases via Docker (Recommended)

```bash
# Start MySQL
docker run -d \
  --name ctf-mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=ctf_platform \
  -p 3306:3306 \
  mysql:8.0

# Start Redis
docker run -d \
  --name ctf-redis \
  -p 6379:6379 \
  redis:7-alpine
```

## 9.3 Option B: Native Installation

```bash
# Ubuntu/Debian - MySQL
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo mysql -e "CREATE DATABASE ctf_platform;"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';"

# Ubuntu/Debian - Redis
sudo apt install redis-server -y
sudo systemctl start redis-server
```

## 9.4 Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create and configure environment file
cp .env.example .env
# Edit .env with your DATABASE_URL, REDIS_URL, JWT_SECRET

# Generate Prisma client
npx prisma generate

# Push schema to the database (creates all tables)
npx prisma db push

# (Optional) Seed demo data
npm run db:seed

# Start development server with hot-reload
npm run dev
# Backend is now running at http://localhost:4000
```

## 9.5 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Start development server
npm run dev
# Frontend is now running at http://localhost:3000
```

## 9.6 Build for Production (Local)

```bash
# Build backend
cd backend
npm run build    # Outputs to dist/
npm start        # Runs compiled JS

# Build frontend
cd frontend
npm run build    # Outputs to .next/
npm start        # Runs production server on port 3000
```

---

# 10. Production Hosting on Linux Server

## 10.1 Recommended Server Specs

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4–8 GB |
| Storage | 20 GB SSD | 50+ GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 1 Gbps | 1 Gbps |

## 10.2 Step 1 — Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget ufw fail2ban

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status

# (Optional) Create a non-root deploy user
sudo adduser deployer
sudo usermod -aG sudo deployer
sudo usermod -aG docker deployer
```

## 10.3 Step 2 — Install Docker & Docker Compose

```bash
# Install Docker Engine (official script)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group (no sudo required)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

## 10.4 Step 3 — Deploy the Application

```bash
# Clone the repository
git clone https://github.com/your-org/ctf-platform.git /opt/ctf-platform
cd /opt/ctf-platform

# Create production environment file
cp backend/.env.example backend/.env
nano backend/.env
```

**Production `.env` configuration:**

```dotenv
DATABASE_URL=mysql://root:STRONG_PASSWORD@mysql:3306/ctf_platform
REDIS_URL=redis://redis:6379
JWT_SECRET=a-very-long-random-string-min-64-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-domain.com
PORT=4000
NODE_ENV=production
```

```bash
# Start production stack
docker compose up -d

# Seed initial data
docker compose exec backend npm run db:seed

# Verify all services are healthy
docker compose ps
```

## 10.5 Step 4 — Production Docker Compose Overrides

Create `docker-compose.prod.yml` for production-specific settings:

```yaml
version: '3.8'

services:
  backend:
    restart: always
    command: sh -c "npx prisma generate && npx prisma db push && npm start"
    environment:
      NODE_ENV: production

  frontend:
    restart: always
    command: sh -c "npm run build && npm start"
    environment:
      NODE_ENV: production

  mysql:
    restart: always

  redis:
    restart: always

  nginx:
    restart: always
```

```bash
# Launch with both files
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 10.6 Step 5 — Systemd Service (Auto-start on Reboot)

Create `/etc/systemd/system/ctf-platform.service`:

```ini
[Unit]
Description=CTF Platform (Docker Compose)
After=docker.service
Requires=docker.service

[Service]
WorkingDirectory=/opt/ctf-platform
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
User=deployer

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable ctf-platform
sudo systemctl start ctf-platform
sudo systemctl status ctf-platform
```

## 10.7 Step 6 — Automated Updates with Watchtower (Optional)

```bash
# Run Watchtower to auto-update containers when images are pushed
docker run -d \
  --name watchtower \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --schedule "0 0 4 * * *"  # Check for updates at 4AM daily
```

---

# 11. Nginx Configuration & SSL

## 11.1 Install Certbot for Free SSL

```bash
# Install Certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal is configured
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## 11.2 Production Nginx Configuration

Update `nginx/conf.d/default.conf` for your domain with SSL:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location /uploads/ {
        alias /uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Mount SSL certificates into the nginx container
# Update docker-compose.yml volumes section for nginx:
volumes:
  - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
  - ./nginx/conf.d:/etc/nginx/conf.d:ro
  - ./uploads:/uploads:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro

# Reload nginx without downtime
docker compose exec nginx nginx -s reload
```

---

# 12. Environment Variables Reference

## 12.1 Backend Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ Yes | — | MySQL connection string (Prisma format) |
| `REDIS_URL` | ✅ Yes | — | Redis connection URL |
| `JWT_SECRET` | ✅ Yes | — | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiry duration |
| `FRONTEND_URL` | ✅ Yes | — | Frontend URL for CORS whitelist |
| `PORT` | No | `4000` | Backend HTTP server port |
| `NODE_ENV` | No | `development` | Runtime environment |

## 12.2 Frontend Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | — | Public API base URL (accessible from browser) |
| `BACKEND_URL` | No | — | Internal backend URL (server-side only) |

---

# 13. Default Credentials & Seeding

After running `npm run db:seed`, the following accounts and challenges are created:

## 13.1 Default Users

| Role | Email | Password | Points |
|---|---|---|---|
| Admin | `admin@ctf.platform` | `admin123` | 0 |
| Demo User | `user@ctf.platform` | `user123` | 0 |

> **⚠️ Security Warning:** Change these credentials immediately before exposing the platform to any users.

## 13.2 Seeded Challenges

| Title | Category | Difficulty | Points |
|---|---|---|---|
| Hello World | Warmup | EASY | 10 |
| Basic SQL Injection | Web | EASY | 50 |
| RSA Basics | Crypto | EASY | 75 |
| Hidden in Plain Sight | Forensics | EASY | 50 |
| JWT Vulnerabilities | Web | MEDIUM | 125 |
| Buffer Overflow 101 | Pwn | MEDIUM | 100 |
| Network Traffic Analysis | Forensics | MEDIUM | 100 |
| XSS Playground | Web | MEDIUM | 150 |
| Active Directory 101 | Windows | HARD (Machine) | 250 |
| Advanced Reverse Engineering | Reverse | HARD | 300 |
| Legacy Linux | Linux | MEDIUM (Machine) | 150 |
| Heap Exploitation | Pwn | EXPERT | 500 |

---

# 14. Admin Panel Guide

The admin panel is accessible at `/admin` and requires a user with `Role = ADMIN`.

## 14.1 Admin Sections

| Section | URL | Capabilities |
|---|---|---|
| **Dashboard** | `/admin` | Platform stats overview |
| **Users** | `/admin/users` | View, ban, manage all users |
| **Challenges** | `/admin/challenges` | Create, edit, delete challenges |
| **Academy** | `/admin/academy` | Manage standalone educational modules |
| **CTF Events** | `/admin/ctf-events` | Create and manage competitive events |
| **Logs** | `/admin/logs` | View system activity log |
| **Settings** | `/admin/settings` | Toggle maintenance mode, global configs |

## 14.2 Creating a Challenge

1. Navigate to **Admin → Challenges**
2. Click **"Initialize_Mission"**
3. Fill in: Title, Category, Type (CHALLENGE/MACHINE), OS, Difficulty, Points, Flag, Description
4. Optionally upload an attachment file
5. Click **"Deploy_Mission"** to publish

## 14.3 Creating an Academy Module

1. Navigate to **Admin → Academy**
2. Click **"Initialize_Module"**
3. Fill in: Title, Category, Type (READING/LAB/VIDEO), Difficulty, Points, Content (Markdown)
4. Optionally upload a cover image
5. Add quiz questions after saving the module
6. Click **"Commit_Node_Deployment"**

---

# 15. Real-time Features (Socket.io)

The platform uses Socket.io for live updates without page refreshes.

## 15.1 Supported Real-time Events

| Event | Direction | Trigger |
|---|---|---|
| `flag_submitted` | Server → Clients | A flag is submitted (correct or wrong) |
| `solve_registered` | Server → Clients | A challenge is solved for the first time |
| `leaderboard_update` | Server → Clients | Rankings change after a solve |
| `notification` | Server → User | Personal notification to a specific user |
| `maintenance_mode` | Server → Clients | Admin toggles maintenance mode |

## 15.2 WebSocket Connection

The frontend connects to Socket.io through Nginx's `/socket.io/` proxy route which upgrades the HTTP connection to a WebSocket. The connection is authenticated implicitly via the same cookie used for REST API calls.

---

# 16. Performance & Caching

## 16.1 Redis Caching Strategy

| Data | TTL | Purpose |
|---|---|---|
| Leaderboard ranking | 60s | Avoid expensive SQL aggregation on every request |
| Rate limit counters | Per-window | Track flag submission frequency per user |
| Session metadata | JWT lifetime | Optional session invalidation support |

## 16.2 Database Optimization

- All foreign keys are indexed via Prisma `@@index` directives
- `@@unique` constraints enforce business rules at the DB level
- Prisma connection pooling handles concurrent request load efficiently

## 16.3 Static Asset Serving

- Nginx serves the `/uploads/` directory with a `7-day Cache-Control` header
- Static Next.js assets (JS, CSS) are cached by the browser with immutable hashes

---

# 17. Terraform & CI/CD

## 17.1 Terraform Configuration

The `terraform/` directory manages GitHub-level infrastructure:

| Resource | Description |
|---|---|
| `github_actions_secret.jwt_secret` | Injects `JWT_SECRET` into GitHub Actions |
| `github_branch_protection.main` | Requires CI to pass before merging to `main` |

```bash
# Initialize Terraform
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your GitHub token and values

terraform init
terraform plan
terraform apply
```

## 17.2 CI/CD Workflow Best Practices

For a production deployment, add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/ctf-platform
            git pull origin main
            docker compose up -d --build
            docker compose exec -T backend npm run db:seed
```

---

# 18. Troubleshooting

## 18.1 Common Issues

| Symptom | Likely Cause | Solution |
|---|---|---|
| Backend fails to start | MySQL not ready | Wait for health check; check `docker compose ps` |
| `Prisma client not generated` | Missing `prisma generate` | Run `docker compose exec backend npx prisma generate` |
| Frontend shows blank page | Wrong `NEXT_PUBLIC_API_URL` | Verify the env variable points to the backend |
| WebSocket disconnects | Nginx timeout | Increase `proxy_read_timeout` in nginx config |
| File uploads fail | Missing `uploads/` directory | Run `mkdir -p uploads && chmod 777 uploads` |
| Rate limiting kicks in | Too many flag attempts | Wait 15 minutes or adjust limits in `authController.ts` |
| Redis connection refused | Redis not started | Run `docker compose restart redis` |

## 18.2 Useful Diagnostic Commands

```bash
# Check all container health
docker compose ps

# View real-time logs
docker compose logs -f

# View backend error logs only
docker compose logs -f backend 2>&1 | grep -i error

# Test database connectivity
docker compose exec mysql mysqladmin ping -h localhost -u root -p

# Test Redis connectivity
docker compose exec redis redis-cli ping

# Access MySQL shell
docker compose exec mysql mysql -u root -p ctf_platform

# Access Prisma Studio (visual DB browser)
docker compose exec backend npx prisma studio
```

---

# 19. Future Enhancements & Roadmap

## 19.1 High Priority Features

| Feature | Description | Complexity |
|---|---|---|
| **Dynamic Flag System** | Per-user unique flags to prevent flag sharing | Medium |
| **Docker Challenge Runners** | Spin up isolated containers per user for machine challenges | High |
| **Email Verification** | SMTP-based account email verification on registration | Low |
| **Password Reset Flow** | Forgot password with secure reset link via email | Low |
| **Two-Factor Authentication** | TOTP-based 2FA (Google Authenticator compatible) | Medium |
| **Discord OAuth** | Social login via Discord (popular in CTF community) | Medium |

## 19.2 Gameplay Enhancements

| Feature | Description | Complexity |
|---|---|---|
| **Point Decay System** | First-blood bonuses; points decrease as more teams solve | Medium |
| **Hint System** | Purchasable hints that deduct points | Low |
| **Certificate Generation** | Auto-generated PDF certificates on event completion | Medium |
| **Achievement Badges** | Gamification: badges for milestones (First Blood, 50 Solves, etc.) | Medium |
| **Challenge Rating System** | Users rate challenge quality after solving | Low |
| **CTF Scoreboard Freeze** | Freeze leaderboard 1 hour before CTF end (standard practice) | Low |
| **Writeup Submission** | Allow users to submit writeups after CTF ends | Medium |

## 19.3 Administrative Improvements

| Feature | Description | Complexity |
|---|---|---|
| **Challenge Import/Export** | Bulk import challenges from YAML/JSON format | Medium |
| **Analytics Dashboard** | Solve rates, user activity heatmaps, challenge difficulty graphs | High |
| **Automated Backups** | Scheduled MySQL dumps to S3/remote storage | Medium |
| **User Country Tracking** | IP-based geolocation for international leaderboards | Low |
| **Announcement System** | Admin broadcasts to all connected users via Socket.io | Low |
| **Audit Log** | Full admin action audit trail | Medium |

## 19.4 Infrastructure & DevOps

| Feature | Description | Complexity |
|---|---|---|
| **Kubernetes Deployment** | Helm chart for scalable K8s deployment | High |
| **CDN Integration** | Cloudflare CDN for static assets and DDoS protection | Low |
| **Horizontal Scaling** | Multiple backend instances behind load balancer | High |
| **Prometheus + Grafana** | Metrics collection and monitoring dashboards | Medium |
| **Automated Testing** | Jest unit tests, Playwright E2E tests | High |
| **Blue/Green Deployment** | Zero-downtime deployments via container swaps | High |

## 19.5 Community Features

| Feature | Description | Complexity |
|---|---|---|
| **Global Chat** | Real-time community chat channel (Discord-style) | Medium |
| **Team Messaging** | Private team chat visible only to team members | Medium |
| **User Profiles** | Public profile page with solve history, badges, country flag | Low |
| **Follow System** | Follow other users to see their activity | Medium |
| **Public CTF Registry** | List of upcoming public CTF events (CTFtime.org integration) | Medium |

---

# Appendix A — Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                  BLACKVAULT CTF PLATFORM                │
│                    Quick Reference                      │
├─────────────────────────────────────────────────────────┤
│  START (Docker):   docker compose up -d                 │
│  STOP (Docker):    docker compose down                  │
│  RESET DATA:       docker compose down -v               │
│  LOGS:             docker compose logs -f               │
│  SEED DB:          docker compose exec backend          │
│                    npm run db:seed                      │
├─────────────────────────────────────────────────────────┤
│  Frontend:         http://localhost:3000                 │
│  Backend API:      http://localhost:4000                 │
│  Via Nginx:        http://localhost                      │
├─────────────────────────────────────────────────────────┤
│  Admin Email:      admin@ctf.platform                   │
│  Admin Password:   admin123                             │
│  User Email:       user@ctf.platform                    │
│  User Password:    user123                              │
└─────────────────────────────────────────────────────────┘
```

---

*BlackVault CTF Platform — Technical Documentation v1.0.0*
*Built with Next.js 14 · Express · Prisma · MySQL · Redis · Socket.io*

