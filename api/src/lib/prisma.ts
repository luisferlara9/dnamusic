// ──────────────────────────────────────────────────────────────
// DNA Music API — Prisma Client Singleton
// Evita múltiples instancias en desarrollo con hot-reload
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

// En desarrollo, hot-reload puede crear múltiples instancias.
// Usamos una variable global para reutilizar la conexión.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
