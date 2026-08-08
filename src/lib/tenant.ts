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

/**
 * Resolves the tenant config from host header.
 * Defaults to Choutuppal App if tenant is not found or for localhost / choutuppal.in.
 */
export async function getTenantFromHost(hostHeader?: string | null): Promise<TenantConfig> {
  if (!hostHeader) return DEFAULT_TENANT

  const cleanHost = hostHeader.split(':')[0].toLowerCase().trim()
  if (!cleanHost || cleanHost === 'localhost' || cleanHost === '127.0.0.1' || cleanHost.includes('choutuppal.in')) {
    return DEFAULT_TENANT
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain: cleanHost },
    })
    if (tenant) {
      return {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        logoUrl: tenant.logoUrl,
        primaryColor: tenant.primaryColor,
        adminPhone: tenant.adminPhone,
      }
    }
  } catch (err) {
    console.error('[TenantResolver] Error fetching tenant for domain:', cleanHost, err)
  }

  return DEFAULT_TENANT
}

/**
 * Reads headers() in Server Components / API routes to return current tenant context.
 */
export async function getCurrentTenant(): Promise<TenantConfig> {
  const headerList = await headers()
  const host = headerList.get('x-tenant-domain') || headerList.get('host')
  return getTenantFromHost(host)
}
