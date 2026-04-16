# Project Structure

This document outlines the organization and components of the CTF Platform.

## Repository Overview

```
ctf-platform/
├── .github/                # GitHub Actions & CI/CD workflows
├── backend/                # Express.js API server (Node.js/TypeScript)
├── database/               # Database related files (SQL scripts, templates)
├── docker/                 # Service-specific Docker configurations
├── frontend/               # Next.js 14 web application (App Router)
├── nginx/                  # Nginx reverse proxy configuration
├── terraform/              # Infrastructure-as-Code (Terraform)
├── uploads/                # Persistent storage for challenge/module assets
├── docker-compose.yml       # Primary orchestration for local development
└── STRUCTURE.md            # [Local Entry Point] Current file
```

---

## 🚀 Backend (`/backend`)

The backend is built with **Node.js**, **Express**, and **TypeScript**, using **Prisma** for database orchestration.

### Core Structure
- `src/controllers/`: Business logic handlers for API endpoints.
- `src/routes/`: Express router definitions.
- `src/middleware/`: Authentication, role-checking, and rate-limiting middleware.
- `src/services/`: External integrations (Redis, Socket.io, Core services).
- `src/config/`: Environment variable mapping and Prisma client initialization.
- `src/utils/`: Shared helper functions and database seeding scripts.
- `prisma/`: Database schema definition and migrations.

### Configuration
- `package.json`: Configured as `type: module` (ESM).
- `tsconfig.json`: Targetting `NodeNext` for modern module resolution.

---

## 🎨 Frontend (`/frontend`)

The frontend is a **Next.js 14** application utilizing the **App Router**, **TailwindCSS**, and **Zustand**.

### Core Structure
- `app/`: Next.js pages and layouts (organized by route).
  - `admin/`: Restricted administrative panels.
  - `challenges/`: Interactive challenge listing and deployment.
  - `teams/`: Tactical squad registry and management.
- `components/`: Reusable React components (UI elements, Layouts).
- `lib/`:
  - `api/`: Axios instances and API service wrappers.
  - `store/`: Zustand state definitions for notifications and auth.
- `styles/`: Tailwind directives and global CSS tokens.

---

## 🏗️ Infrastructure

### Docker & Orchestration
- `docker-compose.yml`: Defines the full stack (MySQL, Redis, Backend, Frontend, Nginx).
- `nginx/`: Handles request routing, SSL termination (if configured), and asset serving.

### Terraform
- `terraform/`: Infrastructure definitions for cloud deployment (e.g., DigitalOcean/AWS).

---

## 🛠️ Data Management
- `database/`: Contains initialization scripts or manual migration trackers outside of Prisma.
- `uploads/`: Centralized directory for all uploaded assets (challenge files, academy images).

---
*Created: April 2026*
