# BlackVault Security

A multi-user Capture The Flag (CTF) cybersecurity training platform similar to Hack The Box.

## Features

- **User Management**: Register, login, role-based access (User/Admin)
- **Challenge System**: Multiple categories (Web, Pwn, Crypto, Reverse, Forensics)
- **Flag Submission**: Secure flag validation with rate limiting
- **Leaderboards**: Real-time user and team rankings
 System**: Create/join teams, collaborate on challenges
- **Real-time Updates**: Socket.io for live notifications- **Team
- **Admin Panel**: Create, edit, delete challenges and manage submissions

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Zustand (State Management)
- Socket.io-client
- Axios

### Backend
- Node.js + Express.js
- TypeScript
- Socket.io
- JWT Authentication
- bcrypt Password Hashing

### Database & Cache
- MySQL 8.0
- Prisma ORM
- Redis

### Infrastructure
- Docker
- Docker Compose
- Nginx (Reverse Proxy)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local Docker Compose

1. Clone the repository
2. Copy development)

### Using environment files:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Start the platform:
   ```bash
   docker-compose up -d
   ```

4. Access the platform:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

### Default Admin Credentials
- Email: admin@ctf.platform
- Password: admin123

### Default Demo User
- Email: user@ctf.platform
- Password: user123

## Project Structure

```
ctf-platform/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   ├── services/     # Business logic
│   │   ├── config/       # Configuration
│   │   └── server.ts     # Entry point
│   └── package.json
│
├── frontend/             # Next.js application
│   ├── app/             # App router pages
│   ├── components/      # React components
│   ├── lib/             # API, stores, utilities
│   └── package.json
│
├── database/
│   └── prisma.schema    # Database schema
│
├── nginx/               # Nginx configuration
├── docker-compose.yml   # Container orchestration
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges` - Create challenge (admin)
- `PUT /api/challenges/:id` - Update challenge (admin)
- `DELETE /api/challenges/:id` - Delete challenge (admin)
- `POST /api/challenges/submit` - Submit flag

### Users
- `GET /api/users` - List users
- `GET /api/users/me` - Get profile
- `GET /api/users/leaderboard/users` - User leaderboard
- `GET /api/users/leaderboard/teams` - Team leaderboard

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams` - List teams
- `POST /api/teams/join` - Join team
- `POST /api/teams/leave` - Leave team

### Submissions
- `GET /api/submissions/history` - User's submission history
- `GET /api/submissions/solves` - User's solved challenges

## Security Features

- JWT authentication with httpOnly cookies
- bcrypt password hashing
- Rate limiting on flag submissions
- Input validation with Zod
- Role-based access control
- SQL injection prevention (Prisma)
- XSS protection (React)

## Development

### Local Development (without Docker)

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**:
   ```bash
   docker run -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=ctf -e MYSQL_USER=ctfuser -e MYSQL_PASSWORD=ctfpassword -p 3306:3306 mysql:8
   ```

4. **Redis**:
   ```bash
   docker run -p 6379:6379 redis:7-alpine
   ```

## Scaling

The platform is designed to handle thousands of concurrent users:

- **Redis caching** for leaderboard data
- **Stateless API servers** for horizontal scaling
- **Nginx load balancing** ready configuration
- **Database connection pooling** via Prisma

## License

MIT
