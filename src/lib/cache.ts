/**
 * High-Performance Stale-While-Revalidate (SWR) In-Memory Cache for Next.js App Router
 * 
 * Provides 0-2ms instant response times for server-side queries by caching in memory
 * and revalidating in the background, with instant cache invalidation upon admin edits.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  staleUntil: number
  isFetching?: boolean
}

const memoryStore = new Map<string, CacheEntry<any>>()
const pendingPromises = new Map<string, Promise<any>>()

interface CacheOptions {
  ttlMs?: number       // How long the data is considered completely fresh (default: 60s)
  staleTtlMs?: number  // How long stale data can be served while revalidating in background (default: 15 mins)
}

const DEFAULT_TTL = 3 * 1000        // 3 seconds fresh
const DEFAULT_STALE_TTL = 10 * 60 * 1000 // 10 minutes stale window

export async function swrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL
  const staleTtlMs = options.staleTtlMs ?? DEFAULT_STALE_TTL
  const now = Date.now()

  const cached = memoryStore.get(key) as CacheEntry<T> | undefined

  // 1. Fresh Cache Hit -> Return instantly (0ms)
  if (cached && (now - cached.timestamp < ttlMs)) {
    return cached.data
  }

  // 2. Stale Cache Hit -> Return stale data instantly (0ms) & revalidate in background
  if (cached && (now - cached.timestamp < staleTtlMs)) {
    if (!cached.isFetching) {
      cached.isFetching = true
      // Background revalidation
      fetcher()
        .then((freshData) => {
          memoryStore.set(key, {
            data: freshData,
            timestamp: Date.now(),
            staleUntil: Date.now() + staleTtlMs,
            isFetching: false,
          })
        })
        .catch((err) => {
          console.warn(`[SWR Cache] Background revalidate failed for key: ${key}`, err?.message || err)
          if (cached) cached.isFetching = false
        })
    }
    return cached.data
  }

  // 3. Cache Miss or Completely Expired -> Fetch with promise deduplication
  let promise = pendingPromises.get(key)
  if (!promise) {
    promise = fetcher()
      .then((freshData) => {
        memoryStore.set(key, {
          data: freshData,
          timestamp: Date.now(),
          staleUntil: Date.now() + staleTtlMs,
          isFetching: false,
        })
        return freshData
      })
      .finally(() => {
        pendingPromises.delete(key)
      })
    pendingPromises.set(key, promise)
  }

  return promise
}

/** Invalidate a specific cache key or keys matching a regex/prefix */
export function invalidateCache(pattern?: string | RegExp) {
  if (!pattern) {
    memoryStore.clear()
    return
  }

  if (typeof pattern === 'string') {
    for (const key of memoryStore.keys()) {
      if (key.startsWith(pattern) || key === pattern) {
        memoryStore.delete(key)
      }
    }
  } else {
    for (const key of memoryStore.keys()) {
      if (pattern.test(key)) {
        memoryStore.delete(key)
      }
    }
  }
}

/** Invalidate all memory caches */
export function invalidateAllCaches() {
  memoryStore.clear()
  pendingPromises.clear()
}
