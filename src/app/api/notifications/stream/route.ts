import { NextRequest } from 'next/server'
import { requireApiUser } from '@/lib/session'
import { notificationEmitter, RealtimeNotificationPayload } from '@/lib/realtime-events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications/stream
 * Server-Sent Events (SSE) endpoint for instant real-time notifications.
 */
export async function GET(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const userId = auth.user.id

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Initial connection greeting
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({
            userId,
            connectedAt: new Date().toISOString(),
          })}\n\n`
        )
      )

      // Periodic ping every 25 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`))
        } catch {
          clearInterval(pingInterval)
        }
      }, 25000)

      // Notification listener callback
      const onNotification = (payload: RealtimeNotificationPayload) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: notification\ndata: ${JSON.stringify(payload)}\n\n`
            )
          )
        } catch (err) {
          console.warn('[SSE] Error sending notification event:', err)
        }
      }

      notificationEmitter.on(`user:${userId}`, onNotification)

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        notificationEmitter.off(`user:${userId}`, onNotification)
        try {
          controller.close()
        } catch {}
      })
    },
    cancel() {
      // client cancelled
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
