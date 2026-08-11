import { cache } from 'react'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { TenantConfig, DEFAULT_TENANT } from './tenant-types'

export * from './tenant-types'

// In-memory TTL cache for custom partner domains (5 minute expiry)
const tenantCacheMap = new Map<string, { config: TenantConfig; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

/**
 * Resolves the tenant config from host header with zero-DB fast paths and React render deduplication.
 */
export const getTenantFromHost = cache(async (hostHeader?: string | null): Promise<TenantConfig> => {
  if (!hostHeader) return DEFAULT_TENANT

  const cleanHost = hostHeader.split(':')[0].toLowerCase().trim()

  // FAST PATH: Immediately return default tenant for Choutuppal domains, localhost, or Vercel previews without hitting DB
  if (
    !cleanHost ||
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost.endsWith('.vercel.app') ||
    cleanHost.includes('choutuppal')
  ) {
    return DEFAULT_TENANT
  }

  // Check in-memory cache first to avoid hitting database on repeated requests
  const cached = tenantCacheMap.get(cleanHost)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.config
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: cleanHost },
    })
    if (tenant) {
      let isExpired = false
      if (tenant.subscriptionExpiresAt && tenant.subscriptionExpiresAt < new Date()) {
        isExpired = true
        // Fire-and-forget update to set status to EXPIRED in DB
        prisma.tenant.update({
          where: { id: tenant.id },
          data: { subscriptionStatus: 'EXPIRED' },
        }).catch(() => {})
      }

      const config: TenantConfig = {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        adminPhone: tenant.adminPhone,
        subscriptionStatus: isExpired ? 'EXPIRED' : (tenant.subscriptionStatus || 'ACTIVE'),
        subscriptionExpiresAt: tenant.subscriptionExpiresAt ? tenant.subscriptionExpiresAt.toISOString() : null,
      }
      tenantCacheMap.set(cleanHost, { config, expiresAt: Date.now() + CACHE_TTL_MS })
      return config
    }
  } catch (err) {
    console.error('[TenantResolver] Error fetching tenant for domain:', cleanHost, err)
  }

  // Cache default fallback to prevent hammering DB on invalid domains
  tenantCacheMap.set(cleanHost, { config: DEFAULT_TENANT, expiresAt: Date.now() + CACHE_TTL_MS })
  return DEFAULT_TENANT
})

/**
 * Reads headers() in Server Components / API routes to return current tenant context safely with React cache deduplication.
 */
export const getCurrentTenant = cache(async (): Promise<TenantConfig> => {
  try {
    const headerList = await headers()
    const host = headerList.get('x-tenant-domain') || headerList.get('host')
    return getTenantFromHost(host)
  } catch {
    return DEFAULT_TENANT
  }
})
