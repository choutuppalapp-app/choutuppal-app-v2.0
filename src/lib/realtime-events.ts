import { EventEmitter } from 'events'

export interface RealtimeNotificationPayload {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
  listingId?: string
  listingTitle?: string
  whatsappClicks?: number
}

// Global EventEmitter singleton for Node.js Next.js runtime
const globalForEvents = globalThis as unknown as {
  notificationEmitter?: EventEmitter
}

export const notificationEmitter =
  globalForEvents.notificationEmitter ?? new EventEmitter()

notificationEmitter.setMaxListeners(300)

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.notificationEmitter = notificationEmitter
} else {
  globalForEvents.notificationEmitter = notificationEmitter
}

/**
 * Emit a real-time notification to a specific user (and any active listening SSE streams).
 */
export function emitRealtimeNotification(userId: string, payload: RealtimeNotificationPayload) {
  try {
    if (!userId) return
    notificationEmitter.emit(`user:${userId}`, payload)
    notificationEmitter.emit('notification:all', payload)
  } catch (err) {
    console.warn('[RealtimeEvents] Failed to emit event:', err)
  }
}
