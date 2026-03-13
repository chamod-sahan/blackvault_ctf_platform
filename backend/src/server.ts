import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import { prisma } from './config/prisma.js';
import { redis } from './services/redis.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import challengeRoutes from './routes/challenges.js';
import teamRoutes from './routes/teams.js';
import submissionRoutes from './routes/submissions.js';
import adminRoutes from './routes/admin.js';
import educationRoutes from './routes/education.js';
import ctfRoutes from './routes/ctf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const isDev = process.env.NODE_ENV === 'development';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 100, // Very high limit for dev
  message: { error: 'Too many requests, please try again later' },
  skip: () => isDev, // Or just skip entirely in dev
});

const flagLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 10,
  keyGenerator: (req) => `flag:${req.user?.id || req.ip}`,
  message: { error: 'Too many flag submissions, please wait' },
  skip: (req) => isDev || !req.user,
});

app.use('/api/', apiLimiter);
app.use('/api/challenges/submit', flagLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/ctf', ctfRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function startServer() {
  try {
    await redis.connect();
    console.log('Connected to Redis');
  } catch (error) {
    // If we're not using lazyConnect, the error will be caught here.
    // With lazyConnect: true, it won't throw until the first command.
    console.warn('Redis connection failed. Features like leaderboards and rate-limiting will be degraded.');
  }

  httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

startServer();

export { app };
