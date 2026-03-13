import { Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

// --- Validation Schemas ---
const pathSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().optional().nullable(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  points: z.number().default(0),
});

const pathModuleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['READING', 'LAB', 'VIDEO']).default('READING'),
  order: z.number(),
  learningPathId: z.string().uuid(),
});

const academyModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  points: z.number().default(0),
  type: z.enum(['READING', 'LAB', 'VIDEO']).default('READING'),
  imageUrl: z.string().optional().nullable(),
});

export const educationController = {
  // --- Learning Paths (Guided) ---
  async createPath(req: AuthRequest, res: Response) {
    try {
      const data = pathSchema.parse(req.body);
      const path = await prisma.learningPath.create({ data });
      await logger.info(`Learning Path created: ${path.title}`, 'EDUCATION_CONTROL', req.user?.id);
      res.status(201).json({ path });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async getPaths(_req: AuthRequest, res: Response) {
    try {
      const paths = await prisma.learningPath.findMany({
        include: { _count: { select: { modules: true } } }
      });
      res.json({ paths });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deletePath(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.learningPath.delete({ where: { id } });
      res.json({ message: 'Path deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  },

  // --- Path Modules ---
  async createPathModule(req: AuthRequest, res: Response) {
    try {
      const data = pathModuleSchema.parse(req.body);
      const module = await prisma.pathModule.create({ data });
      res.status(201).json({ module });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async getPathModules(req: AuthRequest, res: Response) {
    try {
      const { pathId } = req.params;
      const modules = await prisma.pathModule.findMany({
        where: { learningPathId: pathId },
        orderBy: { order: 'asc' },
        include: { questions: true }
      });
      res.json({ modules });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updatePathModule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = pathModuleSchema.partial().parse(req.body);
      const module = await prisma.pathModule.update({
        where: { id },
        data
      });
      res.json({ module });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async deletePathModule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.pathModule.delete({ where: { id } });
      res.json({ message: 'Module deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  },

  // --- Path Questions ---
  async createPathQuestion(req: AuthRequest, res: Response) {
    try {
      const { moduleId, text, answer, hint } = req.body;
      const question = await prisma.pathQuestion.create({
        data: { moduleId, text, answer, hint }
      });
      res.status(201).json({ question });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async updatePathQuestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { text, answer, hint } = req.body;
      const question = await prisma.pathQuestion.update({
        where: { id },
        data: { text, answer, hint }
      });
      res.json({ question });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async deletePathQuestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.pathQuestion.delete({ where: { id } });
      res.json({ message: 'Question deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  },

  // --- Academy (Standalone) ---
  async createAcademyModule(req: AuthRequest, res: Response) {
    try {
      const data = academyModuleSchema.parse(req.body);
      const module = await prisma.academyModule.create({ data });
      await logger.info(`Academy Module created: ${module.title}`, 'ACADEMY_CONTROL', req.user?.id);
      res.status(201).json({ module });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async getAcademyModules(_req: AuthRequest, res: Response) {
    try {
      const modules = await prisma.academyModule.findMany({
        include: { _count: { select: { questions: true } } }
      });
      res.json({ modules });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateAcademyModule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = academyModuleSchema.partial().parse(req.body);
      const module = await prisma.academyModule.update({
        where: { id },
        data
      });
      res.json({ module });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async deleteAcademyModule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.academyModule.delete({ where: { id } });
      res.json({ message: 'Module deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Delete failed' });
    }
  },

  // --- Questions ---
  async createAcademyQuestion(req: AuthRequest, res: Response) {
    try {
      const { moduleId, text, answer, hint } = req.body;
      const question = await prisma.academyQuestion.create({
        data: { moduleId, text, answer, hint }
      });
      res.status(201).json({ question });
    } catch (error) {
      res.status(400).json({ error });
    }
  },

  async uploadImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file' });
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: 'Upload failed' });
    }
  }
};
