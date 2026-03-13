import { prisma } from './src/config/prisma.js';

async function main() {
  try {
    console.log('Testing DB connection...');
    const users = await prisma.user.count();
    const challenges = await prisma.challenge.count();
    const solves = await prisma.solve.count();
    
    console.log('--- DB STATS ---');
    console.log('Users:', users);
    console.log('Challenges:', challenges);
    console.log('Solves:', solves);
    console.log('----------------');
  } catch (error) {
    console.error('DB Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
