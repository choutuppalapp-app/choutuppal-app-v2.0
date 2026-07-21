import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * Custom password-reset flow (maps the Supabase Auth "password reset" feature
 * onto our Prisma DB). Tokens are single-use and expire after 1 hour.
 */

const RESET_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Create a reset token for a user identified by email or phone. */
export async function createPasswordResetToken(
  identifier: string,
): Promise<{ token: string; userId: string } | null> {
  const key = identifier.trim()
  const isEmail = key.includes('@')
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: key.toLowerCase() } : { phone: key },
    select: { id: true },
  })
  if (!user) return null

  const token = randomBytes(32).toString('hex')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires: new Date(Date.now() + RESET_TTL_MS),
    },
  })
  return { token, userId: user.id }
}

/** Verify a reset token (not expired, not used). Returns the userId or null. */
export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  })
  if (!record) return null
  if (record.used) return null
  if (record.expires.getTime() < Date.now()) return null
  return record.userId
}

/** Consume a valid token and set the new password (bcrypt-hashed). */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token)
  if (!userId) return false

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    }),
  ])
  return true
}

/** Hash a password (used by the signup handler). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}
