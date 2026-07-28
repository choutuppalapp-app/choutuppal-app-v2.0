import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client singleton (Prisma v6).
 *
 * In development, Next.js hot-reloads modules which would otherwise spawn a new
 * PrismaClient on every change — quickly exhausting DB connections. We stash
 * the client on `globalThis` so it survives HMR.
 *
 * Both `@/lib/prisma` (this file) and `@/lib/db` (re-export) expose the same
 * singleton instance as `db`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  console.error('[Prisma] CRITICAL: DATABASE_URL environment variable is missing from environment!')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Canonical export name used across the app.
export const db = prisma

export default prisma
