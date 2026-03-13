import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const adminController = {
  async getLogs(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [logs, total] = await Promise.all([
        prisma.log.findMany({
          orderBy: { timestamp: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.log.count(),
      ]);

      res.json({
        logs,
        pagination: {
          total,
          pages: Math.ceil(total / Number(limit)),
          currentPage: Number(page),
        },
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getSettings(_req: AuthRequest, res: Response) {
    try {
      const settings = await prisma.systemSetting.findMany();
      const settingsMap = settings.reduce((acc: any, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {});

      res.json({ settings: settingsMap });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const { settings } = req.body; // e.g., { maintenanceMode: "true" }

      for (const [key, value] of Object.entries(settings)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }

      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
