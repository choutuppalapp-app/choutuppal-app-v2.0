import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser, isAdminRole } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/stories/[id]
 * Deletes the story's R2 media first, then the DB record.
 * Owner or ADMIN/SUPER_ADMIN can delete.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const story = await prisma.story.findUnique({ where: { id } })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = story.ownerId === auth.user.id
  const isAdmin = isAdminRole(auth.user.role)
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete R2 file first (best-effort; don't block the DB delete on storage errors).
  const key = keyFromUrl(story.mediaUrl)
  if (key) {
    await deleteFromR2(key).catch((err) => {
      console.error('[stories] R2 delete failed for', story.id, err)
    })
  }

  await prisma.story.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
