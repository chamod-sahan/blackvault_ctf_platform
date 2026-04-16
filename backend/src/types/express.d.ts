import { User, Role, UserStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: Role;
        status: UserStatus;
        bannedUntil?: Date | null;
      };
    }
  }
}
