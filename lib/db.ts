import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const getPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL || 'file:./dev.db';
  
  // Ensure the database file path is resolved absolutely so Next.js finds it from any runtime context
  let dbUrl = connectionString;
  if (connectionString.startsWith('file:')) {
    const rawPath = connectionString.slice(5);
    if (!path.isAbsolute(rawPath)) {
      const absolutePath = path.resolve(process.cwd(), rawPath);
      dbUrl = `file:${absolutePath}`;
    }
  }

  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
