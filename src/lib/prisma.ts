import { PrismaClient } from '@prisma/client'
import {
  getOfflineListings,
  getOfflineListingById,
  getOfflineListingBySlug,
  saveOfflineListing,
  deleteOfflineListing,
  getOfflineCategories,
  getOfflineVillages,
  getOfflineSettings,
  getOfflineBanners,
  saveOfflineBanner,
  deleteOfflineBanner,
  getOfflineStories,
  saveOfflineStory,
  deleteOfflineStory,
  getOfflineShorts,
  saveOfflineShort,
  deleteOfflineShort,
  getOfflineRealEstates,
  saveOfflineRealEstate,
  deleteOfflineRealEstate,
  getOfflineNews,
  getOfflineBlogs,
  getOfflineNewsBySlug,
  getOfflineBlogBySlug,
  saveOfflineNews,
  deleteOfflineNews,
  saveOfflineBlog,
  deleteOfflineBlog,
  getOfflineUsers,
  saveOfflineUser,
  deleteOfflineUser,
  getOfflineNotifications,
  saveOfflineNotification,
  markOfflineNotificationsRead,
} from './offline-data'

/**
 * Prisma Client singleton with automatic fallback to offline mock data
 * when the database connection is unreachable or tenant credentials are invalid.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  isDbAvailable: boolean | undefined
}

let dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''

// Known expired/deleted tenant prevention
const isKnownDeadTenant = dbUrl.includes('kbieectuamnbzeyrbbme')
if (isKnownDeadTenant) {
  dbUrl = ''
}

if (dbUrl && !dbUrl.includes('connection_limit=')) {
  if (dbUrl.includes('6543') || dbUrl.includes('pooler') || dbUrl.includes('pgbouncer')) {
    dbUrl += dbUrl.includes('?') ? '&pgbouncer=true&connection_limit=15' : '?pgbouncer=true&connection_limit=15'
  }
}

let isDbAvailable = Boolean(dbUrl) && !isKnownDeadTenant

function isConnectionOrInitError(err: any): boolean {
  if (!err) return false
  const msg = String(err.message || '').toLowerCase()
  const name = String(err.name || '')
  const code = String(err.code || '')
  return (
    name === 'PrismaClientInitializationError' ||
    name === 'PrismaClientRustPanicError' ||
    (name === 'PrismaClientKnownRequestError' && (code === 'P1000' || code === 'P1001' || code === 'P1002' || code === 'P1003' || code === 'P1017' || code === 'P2024')) ||
    name === 'TimeoutError' ||
    name === 'AbortError' ||
    code === 'P1000' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1003' ||
    code === 'P1017' ||
    code === 'P2024' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'UND_ERR_CONNECT_TIMEOUT' ||
    code === 'UND_ERR_SOCKET' ||
    msg.includes('tenant') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('connection closed') ||
    msg.includes("can't reach database") ||
    msg.includes('authentication failed') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('aborted') ||
    msg.includes('abort') ||
    msg.includes('operation was aborted') ||
    msg.includes('pool')
  )
}

function handleOfflineQuery(model: string, method: string, args: any[] = []): any {
  const queryArg = args[0] || {}

  switch (model) {
    case 'tenant': {
      const defaultTenantObj = {
        id: 'choutuppal-default',
        name: 'Choutuppal App',
        domain: 'choutuppal.in',
        logoUrl: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
        primaryColor: '#1d4ed8',
        adminPhone: '9494348175',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: null,
      }
      if (method === 'findMany') return [defaultTenantObj]
      if (method === 'findUnique' || method === 'findFirst') return defaultTenantObj
      if (method === 'count') return 1
      if (method === 'create' || method === 'update' || method === 'upsert') return defaultTenantObj
      break
    }

    case 'listing': {
      const all = getOfflineListings()
      if (method === 'findMany') {
        let results = [...all]
        if (queryArg.where) {
          const w = queryArg.where

          if (w.status) {
            results = results.filter((l) => l.status === w.status)
          }
          if (w.isFeatured !== undefined) {
            results = results.filter((l) => Boolean(l.isFeatured) === Boolean(w.isFeatured))
          }
          if (w.categoryId) {
            results = results.filter((l) => l.categoryId === w.categoryId || l.category?.id === w.categoryId)
          }
          if (w.category?.slug && w.category.slug !== 'all') {
            results = results.filter((l) => l.category?.slug === w.category.slug)
          }
          if (w.villageId) {
            results = results.filter((l) => l.villageId === w.villageId || l.village?.id === w.villageId)
          }
          if (w.village?.slug && w.village.slug !== 'all') {
            results = results.filter((l) => l.village?.slug === w.village.slug)
          }
          if (w.id?.not) {
            results = results.filter((l) => l.id !== w.id.not)
          }
          if (w.ownerId) {
            results = results.filter((l) => l.owner?.id === w.ownerId)
          }

          // Handle OR conditions (Search query matching title, phone, village name)
          if (Array.isArray(w.OR) && w.OR.length > 0) {
            results = results.filter((l) => {
              return w.OR.some((cond: any) => {
                if ('expiresAt' in cond) return true
                if ('tenantId' in cond) return true
                if (cond.title?.contains) {
                  const term = String(cond.title.contains).toLowerCase()
                  if (l.title && l.title.toLowerCase().includes(term)) return true
                }
                if (cond.phone?.contains) {
                  const term = String(cond.phone.contains).toLowerCase()
                  if (l.phone && l.phone.includes(term)) return true
                }
                if (cond.secondaryPhone?.contains) {
                  const term = String(cond.secondaryPhone.contains).toLowerCase()
                  if (l.secondaryPhone && l.secondaryPhone.includes(term)) return true
                }
                if (cond.whatsapp?.contains) {
                  const term = String(cond.whatsapp.contains).toLowerCase()
                  if (l.whatsapp && l.whatsapp.includes(term)) return true
                }
                if (cond.village?.name?.contains) {
                  const term = String(cond.village.name.contains).toLowerCase()
                  if (l.village?.name && l.village.name.toLowerCase().includes(term)) return true
                }
                if (cond.categoryId && (l.categoryId === cond.categoryId || l.category?.id === cond.categoryId)) {
                  return true
                }
                if (cond.villageId && (l.villageId === cond.villageId || l.village?.id === cond.villageId)) {
                  return true
                }
                return false
              })
            })
          }
        }

        if (typeof queryArg.skip === 'number') {
          results = results.slice(queryArg.skip)
        }
        if (typeof queryArg.take === 'number') {
          results = results.slice(0, queryArg.take)
        }
        return results
      }
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where?.id) {
          return getOfflineListingById(queryArg.where.id)
        }
        if (queryArg.where?.slug) {
          return getOfflineListingBySlug(queryArg.where.slug)
        }
        return all[0] || null
      }
      if (method === 'count') {
        return all.length
      }
      if (method === 'create') {
        return saveOfflineListing(queryArg.data || {})
      }
      if (method === 'update') {
        return saveOfflineListing({ id: queryArg.where?.id || queryArg.where?.slug, ...queryArg.data })
      }
      if (method === 'upsert') {
        return saveOfflineListing({ id: queryArg.where?.id || queryArg.where?.slug, ...(queryArg.update || queryArg.create || {}) })
      }
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineListing(queryArg.where?.id || queryArg.where?.slug)
        return { count: 1 }
      }
      break
    }

    case 'category': {
      const all = getOfflineCategories()
      if (method === 'findMany') {
        return typeof queryArg.take === 'number' ? all.slice(0, queryArg.take) : all
      }
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where?.id) return all.find((c) => c.id === queryArg.where.id) || all[0] || null
        if (queryArg.where?.slug) return all.find((c) => c.slug === queryArg.where.slug) || all[0] || null
        return all[0] || null
      }
      if (method === 'count') return all.length
      break
    }

    case 'village': {
      const all = getOfflineVillages()
      if (method === 'findMany') {
        return typeof queryArg.take === 'number' ? all.slice(0, queryArg.take) : all
      }
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where?.id) return all.find((v) => v.id === queryArg.where.id) || all[0] || null
        if (queryArg.where?.slug) return all.find((v) => v.slug === queryArg.where.slug) || all[0] || null
        return all[0] || null
      }
      if (method === 'count') return all.length
      break
    }

    case 'setting': {
      const all = getOfflineSettings()
      if (method === 'findMany') return all
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where?.key) return all.find((s) => s.key === queryArg.where.key) || null
        return all[0] || null
      }
      if (method === 'create' || method === 'update' || method === 'upsert') {
        return { key: queryArg.where?.key || queryArg.data?.key, value: queryArg.data?.value || queryArg.update?.value }
      }
      break
    }

    case 'banner': {
      const all = getOfflineBanners()
      if (method === 'findMany') return all
      if (method === 'findUnique' || method === 'findFirst') return all[0] || null
      if (method === 'count') return all.length
      if (method === 'create') return saveOfflineBanner(queryArg.data || {})
      if (method === 'update' || method === 'upsert') return saveOfflineBanner({ id: queryArg.where?.id, ...queryArg.data })
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineBanner(queryArg.where?.id)
        return { count: 1 }
      }
      break
    }

    case 'story': {
      const all = getOfflineStories()
      if (method === 'findMany') return all
      if (method === 'findUnique' || method === 'findFirst') return all[0] || null
      if (method === 'count') return all.length
      if (method === 'create') return saveOfflineStory(queryArg.data || {})
      if (method === 'update' || method === 'upsert') return saveOfflineStory({ id: queryArg.where?.id, ...queryArg.data })
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineStory(queryArg.where?.id)
        return { count: 1 }
      }
      break
    }

    case 'short': {
      const all = getOfflineShorts()
      if (method === 'findMany') return all
      if (method === 'findUnique' || method === 'findFirst') return all[0] || null
      if (method === 'count') return all.length
      if (method === 'create') return saveOfflineShort(queryArg.data || {})
      if (method === 'update' || method === 'upsert') return saveOfflineShort({ id: queryArg.where?.id, ...queryArg.data })
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineShort(queryArg.where?.id)
        return { count: 1 }
      }
      break
    }

    case 'realEstate': {
      const all = getOfflineRealEstates()
      if (method === 'findMany') return all
      if (method === 'findUnique' || method === 'findFirst') return all[0] || null
      if (method === 'count') return all.length
      if (method === 'create') return saveOfflineRealEstate(queryArg.data || {})
      if (method === 'update' || method === 'upsert') return saveOfflineRealEstate({ id: queryArg.where?.id, ...queryArg.data })
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineRealEstate(queryArg.where?.id)
        return { count: 1 }
      }
      break
    }

    case 'news': {
      const all = getOfflineNews()
      if (method === 'findMany') {
        let results = [...all]
        if (queryArg.where) {
          const w = queryArg.where
          if (w.isPublished !== undefined) {
            results = results.filter((n) => Boolean(n.isPublished) === Boolean(w.isPublished))
          }
          if (w.NOT?.id) {
            results = results.filter((n) => n.id !== w.NOT.id)
          }
        }
        if (typeof queryArg.skip === 'number') {
          results = results.slice(queryArg.skip)
        }
        if (typeof queryArg.take === 'number') {
          results = results.slice(0, queryArg.take)
        }
        return results
      }
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where?.slug) return getOfflineNewsBySlug(queryArg.where.slug)
        if (queryArg.where?.id) return getOfflineNewsBySlug(queryArg.where.id)
        return all[0] || null
      }
      if (method === 'count') return all.length
      if (method === 'create') return saveOfflineNews(queryArg.data || {})
      if (method === 'update' || method === 'upsert') return saveOfflineNews({ id: queryArg.where?.id || queryArg.where?.slug, ...queryArg.data })
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineNews(queryArg.where?.id || queryArg.where?.slug)
        return { count: 1 }
      }
      break
    }

    case 'blog': {
      const all = getOfflineBlogs()
      if (method === 'findMany') {
        let results = [...all]
        if (queryArg.where) {
          const w = queryArg.where
          if (w.isPublished !== undefined) {
            results = results.filter((b) => Boolean(b.isPublished) === Boolean(w.isPublished))
          }
          if (w.category && w.category !== 'all') {
            results = results.filter((b) => b.category === w.category)
          }
          if (w.NOT?.id) {
            results = results.filter((b) => b.id !== w.NOT.id)
          }
        }
        if (typeof queryArg.skip === 'number') {
          results = results.slice(queryArg.skip)
        }
        if (typeof queryArg.take === 'number') {
          results = results.slice(0, queryArg.take)
        }
        return results
      }
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where?.slug) return getOfflineBlogBySlug(queryArg.where.slug)
        if (queryArg.where?.id) return getOfflineBlogBySlug(queryArg.where.id)
        return all[0] || null
      }
      if (method === 'count') return all.length
      if (method === 'create') return saveOfflineBlog(queryArg.data || {})
      if (method === 'update' || method === 'upsert') return saveOfflineBlog({ id: queryArg.where?.id || queryArg.where?.slug, ...queryArg.data })
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineBlog(queryArg.where?.id || queryArg.where?.slug)
        return { count: 1 }
      }
      break
    }

    case 'user': {
      const all = getOfflineUsers()
      if (method === 'findMany') {
        let results = [...all]
        if (queryArg.where) {
          const w = queryArg.where
          if (w.role) results = results.filter((u) => u.role === w.role)
          if (w.isBanned !== undefined) results = results.filter((u) => u.isBanned === w.isBanned)
        }
        if (typeof queryArg.take === 'number') results = results.slice(0, queryArg.take)
        return results
      }
      if (method === 'findUnique' || method === 'findFirst') {
        if (queryArg.where) {
          const w = queryArg.where
          if (w.id) {
            const found = all.find((u) => u.id === w.id)
            if (found) return found
          }
          if (w.email) {
            const emailVal = typeof w.email === 'string' ? w.email.toLowerCase() : w.email.equals?.toLowerCase()
            const found = all.find((u) => u.email?.toLowerCase() === emailVal)
            if (found) return found
          }
          if (w.username) {
            const userVal = typeof w.username === 'string' ? w.username.toLowerCase() : w.username.equals?.toLowerCase()
            const found = all.find((u) => u.username?.toLowerCase() === userVal)
            if (found) return found
          }
          if (w.phone) {
            const found = all.find((u) => u.phone === w.phone || (u.phone && w.phone && u.phone.replace(/\D/g, '') === w.phone.replace(/\D/g, '')))
            if (found) return found
          }
          if (w.OR && Array.isArray(w.OR)) {
            for (const cond of w.OR) {
              if (cond.email) {
                const em = typeof cond.email === 'string' ? cond.email.toLowerCase() : cond.email.equals?.toLowerCase()
                const found = all.find((u) => u.email?.toLowerCase() === em)
                if (found) return found
              }
              if (cond.username) {
                const un = typeof cond.username === 'string' ? cond.username.toLowerCase() : cond.username.equals?.toLowerCase()
                const found = all.find((u) => u.username?.toLowerCase() === un)
                if (found) return found
              }
              if (cond.phone) {
                const p = cond.phone
                const found = all.find((u) => u.phone === p || (u.phone && p && u.phone.replace(/\D/g, '') === p.replace(/\D/g, '')))
                if (found) return found
              }
            }
          }
        }
        return all[0] || null
      }
      if (method === 'create') {
        return saveOfflineUser(queryArg.data || {})
      }
      if (method === 'update') {
        return saveOfflineUser({ id: queryArg.where?.id, ...queryArg.data })
      }
      if (method === 'upsert') {
        return saveOfflineUser({ id: queryArg.where?.id, ...(queryArg.update || queryArg.create || {}) })
      }
      if (method === 'delete' || method === 'deleteMany') {
        deleteOfflineUser(queryArg.where?.id)
        return { count: 1 }
      }
      if (method === 'count') return all.length
      break
    }

    case 'notification': {
      const all = getOfflineNotifications()
      if (method === 'findMany') {
        let results = [...all]
        if (queryArg.where?.userId) {
          results = results.filter((n) => n.userId === queryArg.where.userId)
        }
        if (queryArg.where?.isRead !== undefined) {
          results = results.filter((n) => n.isRead === queryArg.where.isRead)
        }
        if (typeof queryArg.take === 'number') {
          results = results.slice(0, queryArg.take)
        }
        return results
      }
      if (method === 'count') {
        let results = [...all]
        if (queryArg.where?.userId) {
          results = results.filter((n) => n.userId === queryArg.where.userId)
        }
        if (queryArg.where?.isRead !== undefined) {
          results = results.filter((n) => n.isRead === queryArg.where.isRead)
        }
        return results.length
      }
      if (method === 'create') {
        return saveOfflineNotification(queryArg.data || {})
      }
      if (method === 'update' || method === 'updateMany') {
        markOfflineNotificationsRead(queryArg.where?.userId, queryArg.where?.id)
        return { count: 1 }
      }
      break
    }

    case 'whatsAppUser': {
      const phone = queryArg.where?.phone || queryArg.data?.phone
      if (method === 'findUnique' || method === 'findFirst') {
        return { id: `wa-user-${phone || 'default'}`, phone: phone || '9494348175', name: 'Choutuppal User', language: 'te', role: 'USER' }
      }
      if (method === 'create' || method === 'update' || method === 'upsert') {
        return { id: `wa-user-${phone || 'default'}`, ...queryArg.data, ...(queryArg.update || {}), phone }
      }
      break
    }

    case 'whatsAppSession': {
      const phone = queryArg.where?.phone || queryArg.data?.phone
      if (method === 'findUnique' || method === 'findFirst') {
        return { id: `wa-sess-${phone || 'default'}`, phone: phone || '9494348175', state: 'MAIN_MENU', context: {}, lastActiveAt: new Date() }
      }
      if (method === 'create' || method === 'update' || method === 'upsert') {
        return { id: `wa-sess-${phone || 'default'}`, state: queryArg.data?.state || queryArg.update?.state || 'MAIN_MENU', context: queryArg.data?.context || queryArg.update?.context || {}, phone, lastActiveAt: new Date() }
      }
      break
    }

    default:
      break
  }

  // Generic fallback for any other model
  if (method === 'findMany') return []
  if (method === 'findUnique' || method === 'findFirst') return null
  if (method === 'count') return 0
  if (method === 'create' || method === 'update' || method === 'upsert') {
    return queryArg.data || queryArg.create || { id: `mock-${Date.now()}` }
  }
  if (method === 'delete' || method === 'updateMany' || method === 'deleteMany') {
    return { count: 0 }
  }
  return null
}

function createModelProxy(realModel: any, modelName: string) {
  return new Proxy(realModel || {}, {
    get(target, method: string) {
      return async (...args: any[]) => {
        if (!isDbAvailable || !realModel) {
          return handleOfflineQuery(modelName, method, args)
        }
        let timer: NodeJS.Timeout | undefined
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
              const timeoutErr = new Error(`Database query ${modelName}.${method} timed out (10s)`)
              timeoutErr.name = 'TimeoutError'
              reject(timeoutErr)
            }, 10000)
          })

          const queryPromise = Promise.resolve().then(() => target[method](...args))
          queryPromise.catch(() => {})

          try {
            return await Promise.race([queryPromise, timeoutPromise])
          } finally {
            if (timer) clearTimeout(timer)
          }
        } catch (err: any) {
          if (isConnectionOrInitError(err)) {
            console.warn(`[PrismaProxy] ${modelName}.${method} DB error/timeout:`, err?.message || err)
            return handleOfflineQuery(modelName, method, args)
          }
          throw err
        }
      }
    },
  })
}

let realClient: PrismaClient | undefined
if (dbUrl) {
  try {
    realClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        datasources: { db: { url: dbUrl } },
        log: ['error'],
      })
    globalForPrisma.prisma = realClient
  } catch {
    isDbAvailable = false
  }
} else {
  isDbAvailable = false
}

export const prisma = new Proxy((realClient || {}) as PrismaClient, {
  get(target: any, prop: string) {
    if (prop === '$connect') {
      return async () => {
        if (!isDbAvailable || !target.$connect) return
        try {
          await target.$connect()
        } catch {}
      }
    }
    if (prop === '$disconnect') {
      return async () => {
        if (target.$disconnect) await target.$disconnect().catch(() => {})
      }
    }
    if (prop === '$transaction') {
      return async (callbackOrPromises: any) => {
        if (Array.isArray(callbackOrPromises)) {
          return Promise.all(callbackOrPromises)
        }
        if (typeof callbackOrPromises === 'function') {
          return callbackOrPromises(prisma)
        }
        return []
      }
    }
    if (prop in target) {
      const val = target[prop]
      if (typeof val === 'object' && val !== null) {
        return createModelProxy(val, prop)
      }
      return val
    }
    return createModelProxy(null, prop)
  },
})

export const db = prisma

/**
 * Safe Database Query Wrapper.
 * Prevents 500 errors and catches unhandled exceptions cleanly.
 */
export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  maxRetries = 1,
  delayMs = 20,
  timeoutMs = 10000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let timer: NodeJS.Timeout | undefined
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          const timeoutErr = new Error(`Database query timed out (${timeoutMs}ms)`)
          timeoutErr.name = 'TimeoutError'
          reject(timeoutErr)
        }, timeoutMs)
      })

      const queryPromise = Promise.resolve().then(() => queryFn())
      queryPromise.catch(() => {})

      const result = await Promise.race([queryPromise, timeoutPromise])
      return (result !== undefined && result !== null) ? result : fallback
    } catch (err: any) {
      console.warn(`[safeDbQuery] Attempt ${attempt}/${maxRetries} failed:`, err?.message || err)
      if (isConnectionOrInitError(err)) {
        if (attempt === maxRetries) {
          return fallback
        }
      }
      if (attempt === maxRetries) {
        return fallback
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
  return fallback
}

export default prisma
