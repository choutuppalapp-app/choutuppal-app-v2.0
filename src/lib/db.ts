/**
 * Re-export of the Prisma singleton from `@/lib/prisma`.
 *
 * Kept for backwards compatibility with the project convention
 * `import { db } from '@/lib/db'`. New code may import from either path.
 */
export { db, prisma, default } from '@/lib/prisma'
