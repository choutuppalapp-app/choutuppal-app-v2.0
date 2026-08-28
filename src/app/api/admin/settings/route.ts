import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/** GET /api/admin/settings — all settings as a key-value map. */
export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const rows = (await (async () => { try { return await prisma.setting.findMany(); } catch(e) { return [] as any; } })())
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value

  // Defaults
  const defaults: Record<string, string> = {
    spin_enabled: 'true',
    pricing_free: 'true',
    announcement_ticker:
      '🪔 Choutuppal App v2.0 is now live — list your business FREE! | 📅 Spin & Win daily rewards | 🏠 List your property free',
  }
  for (const k of Object.keys(defaults)) {
    if (!(k in settings)) settings[k] = defaults[k]
  }
  return NextResponse.json({ ok: true, settings })
}

/**
 * PATCH /api/admin/settings
 * Body: { settings: { key: value, ... } } — upserts each key.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const incoming = (body.settings ?? {}) as Record<string, string>
  if (typeof incoming !== 'object' || Array.isArray(incoming)) {
    return NextResponse.json({ error: 'Invalid settings' }, { status: 400 })
  }

  await prisma.$transaction(
    Object.entries(incoming).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      }),
    ),
  )
  return NextResponse.json({ ok: true })
}
