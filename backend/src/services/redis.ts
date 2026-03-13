import Redis from 'ioredis';
import { config } from '../config/env.js';

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

redis.on('error', (err) => {
  // Silence connection errors to allow backend to start without Redis
  if (err.code === 'ECONNREFUSED') {
    return;
  }
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export const redisService = {
  async getLeaderboard(type: 'users' | 'teams') {
    try {
      const data = await redis.zrevrange(`leaderboard:${type}`, 0, -1, 'WITHSCORES');
      return data;
    } catch (error) {
      console.warn('Redis error (getLeaderboard): Leaderboard data will be empty.');
      return [];
    }
  },

  async updateLeaderboard(type: 'users' | 'teams', userId: string, points: number) {
    try {
      await redis.zadd(`leaderboard:${type}`, points, userId);
    } catch (error) {
      console.warn('Redis error (updateLeaderboard): Points not updated in leaderboard.');
    }
  },

  async getRank(type: 'users' | 'teams', userId: string) {
    try {
      const rank = await redis.zrevrank(`leaderboard:${type}`, userId);
      return rank !== null ? rank + 1 : null;
    } catch (error) {
      return null;
    }
  },

  async getCachedLeaderboard(type: 'users' | 'teams') {
    try {
      const cached = await redis.get(`cached:leaderboard:${type}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      return null;
    }
  },

  async setCachedLeaderboard(type: 'users' | 'teams', data: unknown, ttl = 60) {
    try {
      await redis.setex(`cached:leaderboard:${type}`, ttl, JSON.stringify(data));
    } catch (error) {
      // Ignored
    }
  },

  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      const current = await redis.incr(`ratelimit:${key}`);
      if (current === 1) {
        await redis.expire(`ratelimit:${key}`, windowSeconds);
      }
      return current <= limit;
    } catch (error) {
      // If redis is down, we allow the request (fail-open)
      return true;
    }
  },

  async getRateLimitRemaining(key: string): Promise<number> {
    try {
      const current = await redis.get(`ratelimit:${key}`);
      return current ? Math.max(0, 10 - parseInt(current, 10)) : 10;
    } catch (error) {
      return 10;
    }
  },
};
