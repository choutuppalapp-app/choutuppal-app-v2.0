import { cache } from 'react'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface TenantConfig {
  id: string
  name: string
  domain: string
  logoUrl: string | null
  primaryColor: string
  adminPhone: string
}

export const DEFAULT_TENANT: TenantConfig = {
  id: 'choutuppal-default',
  name: 'Choutuppal App',
  domain: 'choutuppal.in',
  logoUrl: '/logo.png',
  primaryColor: '#1d4ed8',
  adminPhone: '9441348175',
}

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
      const config: TenantConfig = {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        adminPhone: tenant.adminPhone,
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
 * Helper to generate Prisma `where` clause for tenant data isolation.
 * For DEFAULT_TENANT, returns { OR: [{ tenantId }, { tenantId: null }] } to include legacy items.
 * For custom partner tenants, returns { tenantId }.
 */
export function getTenantWhereClause(tenantId: string) {
  if (tenantId === DEFAULT_TENANT.id) {
    return {
      OR: [{ tenantId }, { tenantId: null }],
    }
  }
  return { tenantId }
}

/**
 * Reads headers() in Server Components / API routes to return current tenant context safely.
 */
export async function getCurrentTenant(): Promise<TenantConfig> {
  try {
    const headerList = await headers()
    const host = headerList.get('x-tenant-domain') || headerList.get('host')
    return getTenantFromHost(host)
  } catch {
    return DEFAULT_TENANT
  }
}
