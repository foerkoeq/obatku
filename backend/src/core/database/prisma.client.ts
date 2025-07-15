import { PrismaClient } from '@prisma/client';

// Global variable untuk reuse connection
declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern untuk Prisma Client
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'colorless',
});

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

// Export types for convenience
export type { PrismaClient } from '@prisma/client';
