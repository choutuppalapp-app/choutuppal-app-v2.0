import { PrismaClient } from '@prisma/client'
import {
  getOfflineListings,
  getOfflineListingById,
  getOfflineListingBySlug,
  getOfflineCategories,
  getOfflineVillages,
  getOfflineSettings,
  getOfflineBanners,
} from './offline-data'

/**
 * Prisma Client singleton with automatic fallback to offline mock data
 * when the database connection is unreachable or tenant credentials are invalid.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  isDbAvailable: boolean | undefined
}

let dbUrl = process.env.DATABASE_URL || ''

// Known expired/deleted tenant prevention
const isKnownDeadTenant = dbUrl.includes('kbieectuamnbzeyrbbme')
if (isKnownDeadTenant) {
  dbUrl = ''
}

if (dbUrl && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += dbUrl.includes('?') ? '&pgbouncer=true&connection_limit=1' : '?pgbouncer=true&connection_limit=1'
}

let isDbAvailable = globalForPrisma.isDbAvailable ?? (Boolean(dbUrl) && !isKnownDeadTenant)

function isConnectionOrInitError(err: any): boolean {
  if (!err) return false
  const msg = String(err.message || '').toLowerCase()
  const name = String(err.name || '')
  const code = String(err.code || '')
  return (
    name === 'PrismaClientInitializationError' ||
    name === 'PrismaClientRustPanicError' ||
    code === 'P1000' ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1003' ||
    code === 'P1017' ||
    msg.includes('tenant') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('connection closed') ||
    msg.includes("can't reach database") ||
    msg.includes('authentication failed')
  )
}

function handleOfflineQuery(model: string, method: string, args: any[] = []): any {
  const queryArg = args[0] || {}

  switch (model) {
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

          // Handle OR conditions (Search query matching title, phone, village name)
          if (Array.isArray(w.OR) && w.OR.length > 0) {
            results = results.filter((l) => {
              return w.OR.some((cond: any) => {
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
      break
    }

    case 'banner': {
      const all = getOfflineBanners()
      if (method === 'findMany') return all
      if (method === 'findUnique' || method === 'findFirst') return all[0] || null
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
        try {
          return await target[method](...args)
        } catch (err: any) {
          if (isConnectionOrInitError(err)) {
            isDbAvailable = false
            globalForPrisma.isDbAvailable = false
            console.warn(`[Prisma] Database offline (${err.name}). Using offline fallback dataset.`)
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
        } catch (err: any) {
          if (isConnectionOrInitError(err)) {
            isDbAvailable = false
            globalForPrisma.isDbAvailable = false
          }
        }
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
  delayMs = 200
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn()
      return (result !== undefined && result !== null) ? result : fallback
    } catch (err: any) {
      if (isConnectionOrInitError(err)) {
        isDbAvailable = false
        globalForPrisma.isDbAvailable = false
        return fallback
      }
      if (attempt === maxRetries) {
        return fallback
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return fallback
}

export default prisma
