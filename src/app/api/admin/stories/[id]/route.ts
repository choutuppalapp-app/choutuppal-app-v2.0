import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * DELETE /api/admin/stories/[id]
 * Admin moderation: delete any active story (spam control).
 * Deletes R2 media first, then the DB record.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const story = await prisma.story.findUnique({ where: { id } })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const key = keyFromUrl(story.mediaUrl)
  if (key) {
    await deleteFromR2(key).catch(() => {})
  }

  await prisma.story.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
