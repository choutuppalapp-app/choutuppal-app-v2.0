import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

const PatchSchema = z.object({
  action: z.enum(['ban', 'unban', 'promote_agent', 'promote_admin', 'demote_user', 'reset_password', 'update_tier']),
  password: z.string().min(6).max(72).optional(),
  planTier: z.string().optional(),
})

/**
 * PATCH /api/admin/users/[id]
 * Body: { action, password?, planTier? }
 *   ban / unban / promote_agent / promote_admin / demote_user / reset_password / update_tier
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: targetId } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }
  const { action, password, planTier } = parsed.data

  // Guard: don't let an admin ban/demote themselves.
  if (targetId === auth.user.id && (action === 'ban' || action === 'demote_user')) {
    return NextResponse.json({ error: 'You cannot ban or demote yourself' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  switch (action) {
    case 'ban':
      await prisma.user.update({ where: { id: targetId }, data: { isBanned: true } })
      break
    case 'unban':
      await prisma.user.update({ where: { id: targetId }, data: { isBanned: false } })
      break
    case 'promote_agent':
      await prisma.user.update({ where: { id: targetId }, data: { role: 'AGENT' } })
      break
    case 'promote_admin':
      await prisma.user.update({ where: { id: targetId }, data: { role: 'ADMIN' } })
      break
    case 'demote_user':
      await prisma.user.update({ where: { id: targetId }, data: { role: 'USER' } })
      break
    case 'update_tier':
      if (!planTier) return NextResponse.json({ error: 'planTier required' }, { status: 400 })
      await prisma.user.update({ where: { id: targetId }, data: { planTier } })
      break
    case 'reset_password': {
      if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
      const passwordHash = await bcrypt.hash(password, 12)
      await prisma.user.update({ where: { id: targetId }, data: { passwordHash } })
      break
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
