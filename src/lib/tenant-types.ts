export interface TenantConfig {
  id: string
  name: string
  domain: string
  logoUrl: string | null
  primaryColor: string
  adminPhone: string
  subscriptionStatus: string
  subscriptionExpiresAt: string | null
}

export const DEFAULT_TENANT: TenantConfig = {
  id: 'choutuppal-default',
  name: 'Choutuppal App',
  domain: 'choutuppal.in',
  logoUrl: '/logo.webp',
  primaryColor: '#1d4ed8',
  adminPhone: '9494348175',
  subscriptionStatus: 'ACTIVE',
  subscriptionExpiresAt: null,
}

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
