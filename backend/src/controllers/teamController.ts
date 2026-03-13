import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const createTeamSchema = z.object({
  name: z.string().min(3).max(50),
});

const joinTeamSchema = z.object({
  teamId: z.string().uuid(),
});

export const teamController = {
  async createTeam(req: AuthRequest, res: Response) {
    try {
      const data = createTeamSchema.parse(req.body);

      const existingTeam = await prisma.team.findUnique({
        where: { name: data.name },
      });

      if (existingTeam) {
        return res.status(400).json({ error: 'Team name already exists' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { teamMember: true },
      });

      if (user?.teamMember) {
        return res.status(400).json({ error: 'You are already in a team' });
      }

      const team = await prisma.$transaction(async (tx) => {
        const newTeam = await tx.team.create({
          data: { name: data.name },
        });

        await tx.teamMember.create({
          data: {
            userId: req.user!.id,
            teamId: newTeam.id,
            role: 'LEADER',
          },
        });

        return newTeam;
      });

      res.status(201).json({ team });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create team error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async joinTeam(req: AuthRequest, res: Response) {
    try {
      const data = joinTeamSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { teamMember: true },
      });

      if (user?.teamMember) {
        return res.status(400).json({ error: 'You are already in a team' });
      }

      const team = await prisma.team.findUnique({
        where: { id: data.teamId },
        include: { members: true },
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      await prisma.teamMember.create({
        data: {
          userId: req.user!.id,
          teamId: data.teamId,
          role: 'MEMBER',
        },
      });

      res.json({ message: 'Joined team successfully', team });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Join team error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async leaveTeam(req: AuthRequest, res: Response) {
    try {
      const teamMember = await prisma.teamMember.findUnique({
        where: { userId: req.user!.id },
      });

      if (!teamMember) {
        return res.status(400).json({ error: 'You are not in a team' });
      }

      if (teamMember.role === 'LEADER') {
        return res.status(400).json({ error: 'Team leader cannot leave. Transfer leadership first or delete the team.' });
      }

      await prisma.teamMember.delete({
        where: { userId: req.user!.id },
      });

      res.json({ message: 'Left team successfully' });
    } catch (error) {
      console.error('Leave team error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getTeams(_req: AuthRequest, res: Response) {
    try {
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

      const teamsWithPoints = teams.map((team) => ({
        ...team,
        totalPoints: team.members.reduce((sum, m) => sum + m.user.points, 0),
      }));

      res.json({ teams: teamsWithPoints });
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getMyTeam(req: AuthRequest, res: Response) {
    try {
      const teamMember = await prisma.teamMember.findUnique({
        where: { userId: req.user!.id },
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                      points: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!teamMember) {
        return res.status(404).json({ error: 'No team found' });
      }

      res.json({ team: teamMember.team });
    } catch (error) {
      console.error('Get my team error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
