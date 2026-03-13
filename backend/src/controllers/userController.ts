import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const userController = {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          solves: {
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
          },
          teamMember: {
            include: {
              team: {
                include: {
                  members: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          username: true,
                          points: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { passwordHash, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          role: true,
          points: true,
          createdAt: true,
          solves: {
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
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getUsers(_req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          points: true,
          status: true,
          bannedUntil: true,
          createdAt: true,
        },
        orderBy: { points: 'desc' },
      });

      res.json({ users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getLeaderboard(req: AuthRequest, res: Response) {
    try {
      const { type = 'users', country } = req.query;

      if (type === 'teams') {
        const teams = await prisma.team.findMany({
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    points: true,
                  },
                },
              },
            },
          },
        });

        const teamLeaderboard = teams
          .map((team) => ({
            id: team.id,
            name: team.name,
            points: team.members.reduce((sum, m) => sum + m.user.points, 0),
            memberCount: team.members.length,
          }))
          .sort((a, b) => b.points - a.points);

        return res.json({ leaderboard: teamLeaderboard });
      }

      const where: any = {};
      if (country && country !== 'GLOBAL') {
        where.country = country;
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          points: true,
          country: true,
          createdAt: true,
        },
        orderBy: { points: 'desc' },
        take: 100,
      });

      res.json({ leaderboard: users });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getStats(_req: AuthRequest, res: Response) {
    try {
      const [userCount, challengeCount, solveCount, expiredCount] = await Promise.all([
        prisma.user.count(),
        prisma.challenge.count({ where: { isExpired: false } }),
        prisma.solve.count(),
        prisma.challenge.count({ where: { isExpired: true } }),
      ]);

      res.json({
        stats: {
          users: userCount,
          challenges: challengeCount,
          solves: solveCount,
          expired: expiredCount,
        },
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role, points, country, status, bannedUntil } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          role,
          points: points !== undefined ? parseInt(points) : undefined,
          country,
          status,
          bannedUntil: bannedUntil ? new Date(bannedUntil) : (status === 'ACTIVE' ? null : undefined),
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          points: true,
          country: true,
          status: true,
          bannedUntil: true,
        },
      });

      await logger.info(`User updated: ${user.username}`, 'USER_CONTROL', req.user?.id);

      res.json({ user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (id === req.user!.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
      }

      await prisma.user.delete({
        where: { id },
      });

      await logger.warn(`User deleted: ${id}`, 'USER_CONTROL', req.user?.id);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
