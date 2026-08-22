const fs = require('fs');
const file = 'src/lib/home-data.ts';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `export async function getFeaturedListings() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: {
          ...tenantFilter,
          status: 'APPROVED',
          isFeatured: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          logo: true,
          avgRating: true,
          views: true,
          isFeatured: true,
          villageId: true,
          categoryId: true,
          category: { select: { id: true, name: true, slug: true } },
          village: { select: { id: true, name: true, slug: true } },
        },
      }),
    [],
  )
}`;

const replaceStr = `export async function getFeaturedListings() {
  return safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: {
          status: 'APPROVED',
          isFeatured: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          logo: true,
          phone: true,
          whatsapp: true,
          avgRating: true,
          views: true,
          isFeatured: true,
          villageId: true,
          categoryId: true,
          category: { select: { id: true, name: true, slug: true } },
          village: { select: { id: true, name: true, slug: true } },
        },
      }),
    [],
  )
}`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
console.log('patched');
