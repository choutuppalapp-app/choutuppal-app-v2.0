const fs = require('fs');
const file = 'src/lib/home-data.ts';
let code = fs.readFileSync(file, 'utf8');

const targetBanners = `export async function getActiveBanners() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.banner.findMany({
        where: { ...tenantFilter, expiresAt: { gt: new Date() }, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    [],
  )
}`;

const replaceBanners = `export async function getActiveBanners() {
  return safeDbQuery(
    () =>
      prisma.banner.findMany({
        where: { expiresAt: { gt: new Date() }, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    [],
  )
}`;

code = code.replace(targetBanners, replaceBanners);

fs.writeFileSync(file, code);
console.log('patched home-data.ts');
