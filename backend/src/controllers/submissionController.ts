import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const submissionController = {
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const submissions = await prisma.submission.findMany({
        where: { userId: req.user!.id },
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
              points: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      res.json({ submissions });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getSolves(req: AuthRequest, res: Response) {
    try {
      const solves = await prisma.solve.findMany({
        where: { userId: req.user!.id },
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
              points: true,
            },
          },
        },
        orderBy: { solvedAt: 'desc' },
      });

      res.json({ solves });
    } catch (error) {
      console.error('Get solves error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getAllSubmissions(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [submissions, total] = await Promise.all([
        prisma.submission.findMany({
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            challenge: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.submission.count(),
      ]);

      res.json({
        submissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get all submissions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
