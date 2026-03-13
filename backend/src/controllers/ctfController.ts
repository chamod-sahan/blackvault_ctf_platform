import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const ctfSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['LIVE', 'UPCOMING', 'COMPLETED']).default('UPCOMING'),
  prize: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  bannerUrl: z.string().optional(),
});

export const ctfController = {
  async createEvent(req: AuthRequest, res: Response) {
    try {
      const data = ctfSchema.parse(req.body);
      const event = await prisma.ctfEvent.create({
        data: {
          ...data,
          bannerUrl: req.file ? `/uploads/${req.file.filename}` : undefined
        }
      });
      await logger.info(`CTF Event created: ${event.title}`, 'CTF_CONTROL', req.user?.id);
      res.status(201).json({ event });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(400).json({ error });
    }
  },

  async getEvents(_req: AuthRequest, res: Response) {
    try {
      const events = await prisma.ctfEvent.findMany({
        orderBy: { startTime: 'asc' },
      });
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.ctfEvent.delete({ where: { id } });
      await logger.warn(`CTF Event deleted: ${id}`, 'CTF_CONTROL', req.user?.id);
      res.json({ message: 'Event deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  },

  async updateEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = ctfSchema.partial().parse(req.body);

      const updateData: any = { ...data };
      if (req.file) {
        updateData.bannerUrl = `/uploads/${req.file.filename}`;
      }

      const event = await prisma.ctfEvent.update({
        where: { id },
        data: updateData
      });

      await logger.info(`CTF Event updated: ${event.title}`, 'CTF_CONTROL', req.user?.id);
      res.json({ event });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Update failed' });
    }
  },

  async uploadBanner(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { eventId } = req.body;

      const event = await prisma.ctfEvent.update({
        where: { id: eventId },
        data: {
          bannerUrl: `/uploads/${req.file.filename}`,
        },
      });

      res.json({ event, bannerUrl: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error('Upload banner error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async registerEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { type, teamId } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (type === 'SOLO') {
        // Check if already registered solo
        const existing = await prisma.ctfRegistration.findUnique({
          where: {
            solo_registration: {
              eventId: id,
              userId: req.user.id,
            },
          },
        });

        if (existing) {
          return res.status(400).json({ error: 'Already registered for this event' });
        }

        const registration = await prisma.ctfRegistration.create({
          data: {
            eventId: id,
            userId: req.user.id,
            type: 'SOLO',
          },
        });

        await logger.info(`User ${req.user.id} registered solo for event ${id}`, 'CTF_REG', req.user.id);
        return res.status(201).json({ registration });
      } else if (type === 'TEAM') {
        if (!teamId) {
          return res.status(400).json({ error: 'Team ID is required for team registration' });
        }

        // Check if team exists and user is a member
        const teamMember = await prisma.teamMember.findFirst({
          where: {
            teamId,
            userId: req.user.id,
          },
        });

        if (!teamMember) {
          return res.status(403).json({ error: 'You are not a member of this team' });
        }

        // Check if team already registered
        const existing = await prisma.ctfRegistration.findUnique({
          where: {
            team_registration: {
              eventId: id,
              teamId,
            },
          },
        });

        if (existing) {
          return res.status(400).json({ error: 'Team already registered for this event' });
        }

        const registration = await prisma.ctfRegistration.create({
          data: {
            eventId: id,
            teamId,
            type: 'TEAM',
          },
        });

        await logger.info(`Team ${teamId} registered for event ${id}`, 'CTF_REG', req.user.id);
        return res.status(201).json({ registration });
      } else {
        return res.status(400).json({ error: 'Invalid registration type' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  async getRegistrationStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const soloRegistration = await prisma.ctfRegistration.findUnique({
        where: {
          solo_registration: {
            eventId: id,
            userId: req.user.id,
          },
        },
      });

      const teamMemberships = await prisma.teamMember.findMany({
        where: { userId: req.user.id },
        select: { teamId: true }
      });

      const teamIds = teamMemberships.map(m => m.teamId);

      const teamRegistration = await prisma.ctfRegistration.findFirst({
        where: {
          eventId: id,
          teamId: { in: teamIds },
          type: 'TEAM'
        },
        include: { team: true }
      });

      res.json({
        isRegistered: !!soloRegistration || !!teamRegistration,
        registration: soloRegistration || teamRegistration,
        type: soloRegistration ? 'SOLO' : (teamRegistration ? 'TEAM' : null)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get status' });
    }
  }
};
