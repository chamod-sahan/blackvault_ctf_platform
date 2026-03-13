import { prisma } from '../config/prisma.js';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export const logger = {
  async log(level: LogLevel, message: string, source?: string, userId?: string) {
    console.log(`[${level}] ${source ? `(${source}) ` : ''}${message}`);
    
    try {
      await prisma.log.create({
        data: {
          level,
          message,
          source,
          userId,
        },
      });
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  },

  info(message: string, source?: string, userId?: string) {
    return this.log('INFO', message, source, userId);
  },

  warn(message: string, source?: string, userId?: string) {
    return this.log('WARN', message, source, userId);
  },

  error(message: string, source?: string, userId?: string) {
    return this.log('ERROR', message, source, userId);
  },

  debug(message: string, source?: string, userId?: string) {
    return this.log('DEBUG', message, source, userId);
  },
};
