import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/env.js';
import { io } from '../server.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const challengeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['CHALLENGE', 'MACHINE']).default('CHALLENGE'),
  os: z.enum(['WINDOWS', 'LINUX', 'OTHER']).nullable().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  points: z.number().min(1),
  flag: z.string().min(1),
  isDynamic: z.boolean().optional().default(false),
  flagTemplate: z.string().optional(),
  dockerImage: z.string().optional(),
  isExpired: z.boolean().optional().default(false),
});

const generateUserFlag = (userId: string, challengeId: string, template: string | null) => {
  const hash = crypto.createHash('sha256')
    .update(`${userId}-${challengeId}-${config.jwtSecret}`)
    .digest('hex')
    .substring(0, 16);
  
  if (template && template.includes('{hash}')) {
    return template.replace('{hash}', hash);
  }
  return template ? template.replace('{}', hash) : `CTF{${hash}}`;
};

export const challengeController = {
  async getChallenges(req: AuthRequest, res: Response) {
    try {
      const { category, difficulty } = req.query;

      const where: Record<string, unknown> = {};
      if (category) where.category = category;
      if (difficulty) where.difficulty = difficulty;

      const challenges = await prisma.challenge.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          type: true,
          os: true,
          difficulty: true,
          points: true,
          isDynamic: true,
          isExpired: true,
          attachmentUrl: true,
          attachmentName: true,
          writeupUrl: true,
          writeupName: true,
          createdAt: true,
        },
        orderBy: [{ points: 'asc' }, { createdAt: 'desc' }],
      });

      let solvedChallengeIds: string[] = [];
      if (req.user) {
        const solves = await prisma.solve.findMany({
          where: { userId: req.user.id },
          select: { challengeId: true },
        });
        solvedChallengeIds = solves.map((s) => s.challengeId);
      }

      const challengesWithSolvedStatus = challenges.map((c) => ({
        ...c,
        solved: solvedChallengeIds.includes(c.id),
      }));

      res.json({ challenges: challengesWithSolvedStatus });
    } catch (error) {
      console.error('Get challenges error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getChallengeById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const challenge = await prisma.challenge.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          type: true,
          os: true,
          difficulty: true,
          points: true,
          isDynamic: true,
          isExpired: true,
          dockerImage: true,
          attachmentUrl: true,
          attachmentName: true,
          writeupUrl: true,
          writeupName: true,
          createdAt: true,
          flagTemplate: true,
        },
      });

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      let userSpecificFlag = null;
      if (req.user && challenge.isDynamic) {
        const existingFlag = await prisma.userChallengeFlag.findUnique({
          where: {
            userId_challengeId: {
              userId: req.user.id,
              challengeId: id,
            },
          },
        });

        if (existingFlag) {
          userSpecificFlag = existingFlag.flag;
        } else {
          const newFlag = generateUserFlag(req.user.id, id, challenge.flagTemplate);
          const savedFlag = await prisma.userChallengeFlag.create({
            data: {
              userId: req.user.id,
              challengeId: id,
              flag: newFlag,
            },
          });
          userSpecificFlag = savedFlag.flag;
        }
      }

      let solved = false;
      if (req.user) {
        const solve = await prisma.solve.findUnique({
          where: {
            userId_challengeId: {
              userId: req.user.id,
              challengeId: id,
            },
          },
        });
        solved = !!solve;
      }

      res.json({ 
        challenge: { 
          ...challenge, 
          solved,
          userFlag: userSpecificFlag // Only returned if dynamic
        } 
      });
    } catch (error) {
      console.error('Get challenge error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createChallenge(req: AuthRequest, res: Response) {
    try {
      const data = challengeSchema.parse(req.body);
      const flagHash = await bcrypt.hash(data.flag, 12);

      const challenge = await prisma.challenge.create({
        data: {
          ...data,
          flagHash,
        },
      });

      await logger.info(`Challenge created: ${challenge.title}`, 'CHALLENGE_CONTROL', req.user?.id);

      res.status(201).json({ challenge });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create challenge error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateChallenge(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = challengeSchema.partial().parse(req.body);

      const challenge = await prisma.challenge.update({
        where: { id },
        data: data.flag ? { ...data, flagHash: await bcrypt.hash(data.flag, 12) } : data,
      });

      await logger.info(`Challenge updated: ${challenge.title}`, 'CHALLENGE_CONTROL', req.user?.id);

      res.json({ challenge });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Update challenge error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteChallenge(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.challenge.delete({
        where: { id },
      });

      await logger.warn(`Challenge deleted: ${id}`, 'CHALLENGE_CONTROL', req.user?.id);

      res.json({ message: 'Challenge deleted successfully' });
    } catch (error) {
      console.error('Delete challenge error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async uploadAttachment(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { challengeId } = req.body;

      const challenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          attachmentUrl: `/uploads/${req.file.filename}`,
          attachmentName: req.file.originalname,
        },
      });

      res.json({ challenge, fileUrl: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error('Upload attachment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async uploadWriteup(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { challengeId } = req.body;

      // Optional: Delete old file if exists
      const oldChallenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: { writeupUrl: true },
      });

      if (oldChallenge?.writeupUrl) {
        const oldFilePath = path.join(process.cwd(), oldChallenge.writeupUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (e) {
          // Ignore if file doesn't exist
        }
      }

      const challenge = await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          writeupUrl: `/uploads/${req.file.filename}`,
          writeupName: req.file.originalname,
        },
      });

      res.json({ challenge, fileUrl: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error('Upload writeup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteWriteup(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params; // Challenge ID

      const challenge = await prisma.challenge.findUnique({
        where: { id },
        select: { writeupUrl: true },
      });

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      if (challenge.writeupUrl) {
        const filePath = path.join(process.cwd(), challenge.writeupUrl);
        try {
          await fs.unlink(filePath);
        } catch (e) {
          // Ignore if file doesn't exist
        }
      }

      await prisma.challenge.update({
        where: { id },
        data: {
          writeupUrl: null,
          writeupName: null,
        },
      });

      res.json({ message: 'Writeup deleted successfully' });
    } catch (error) {
      console.error('Delete writeup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  async submitFlag(req: AuthRequest, res: Response) {
    try {
      const { challengeId, flag } = req.body;

      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
      });

      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      const existingSolve = await prisma.solve.findUnique({
        where: {
          userId_challengeId: {
            userId: req.user!.id,
            challengeId,
          },
        },
      });

      if (existingSolve) {
        return res.status(400).json({ error: 'Challenge already solved' });
      }

      let correct = false;

      if (challenge.isDynamic) {
        const userFlag = await prisma.userChallengeFlag.findUnique({
          where: {
            userId_challengeId: {
              userId: req.user!.id,
              challengeId,
            },
          },
        });

        if (userFlag) {
          correct = userFlag.flag === flag;
        } else {
          // If flag doesn't exist for user, maybe generate it now or reject
          const newFlag = generateUserFlag(req.user!.id, challengeId, challenge.flagTemplate);
          await prisma.userChallengeFlag.create({
            data: {
              userId: req.user!.id,
              challengeId,
              flag: newFlag,
            },
          });
          correct = newFlag === flag;
        }
      } else {
        correct = await bcrypt.compare(flag, challenge.flagHash);
      }

      await prisma.submission.create({
        data: {
          userId: req.user!.id,
          challengeId,
          submittedFlag: flag,
          correct,
        },
      });

      if (correct) {
        await prisma.$transaction([
          prisma.solve.create({
            data: {
              userId: req.user!.id,
              challengeId,
              points: challenge.points,
            },
          }),
          prisma.user.update({
            where: { id: req.user!.id },
            data: {
              points: {
                increment: challenge.points,
              },
            },
          }),
        ]);

        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { username: true },
        });

        await logger.info(`User ${user?.username} solved ${challenge.title}`, 'FLAG_SUBMISSION', req.user?.id);

        io.emit('challenge:solved', {
          challengeId,
          challengeTitle: challenge.title,
          userId: req.user!.id,
          username: user?.username,
          points: challenge.points,
        });

        res.json({
          correct: true,
          message: 'Flag correct!',
          points: challenge.points,
        });
      } else {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { username: true },
        });
        await logger.warn(`User ${user?.username} failed flag for ${challenge.title}`, 'FLAG_SUBMISSION', req.user?.id);

        res.json({
          correct: false,
          message: 'Flag incorrect',
        });
      }
    } catch (error) {
      console.error('Submit flag error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getCategories(_req: AuthRequest, res: Response) {
    try {
      const categories = await prisma.challenge.findMany({
        select: { category: true },
        distinct: ['category'],
      });

      res.json({ categories: categories.map((c) => c.category) });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
