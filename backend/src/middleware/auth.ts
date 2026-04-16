import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { Role, UserStatus } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: Role;
    status: UserStatus;
    bannedUntil?: Date | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      username: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        username: true, 
        role: true,
        status: true,
        bannedUntil: true
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check for bans
    if (user.status === 'BANNED') {
      return res.status(403).json({ error: 'ACCOUNT_TERMINATED: Your access has been permanently revoked.' });
    }

    if (user.status === 'TEMP_BANNED' && user.bannedUntil) {
      if (new Date() < user.bannedUntil) {
        return res.status(403).json({ 
          error: `ACCOUNT_SUSPENDED: Your access is restricted until ${user.bannedUntil.toLocaleString()}.` 
        });
      } else {
        // Automatically lift expired temp ban
        await prisma.user.update({
          where: { id: user.id },
          data: { status: 'ACTIVE', bannedUntil: null }
        });
      }
    }

    // Check for maintenance mode
    const maintenanceMode = await prisma.systemSetting.findUnique({
      where: { key: 'maintenanceMode' }
    });

    if (maintenanceMode?.value === 'true' && user.role !== 'ADMIN') {
      return res.status(503).json({ 
        error: 'SYSTEM_MAINTENANCE: The platform is undergoing scheduled maintenance. Please check back later.' 
      });
    }

    req.user = user as any;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
