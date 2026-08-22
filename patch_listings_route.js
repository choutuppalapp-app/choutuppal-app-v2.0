const fs = require('fs');
const file = 'src/app/api/listings/route.ts';
let code = fs.readFileSync(file, 'utf8');

// Update the Zod schema if necessary, or just update the prisma.listing.create block.
// The user asked to add `isFeatured: Boolean(body.isFeatured)` to the Prisma create data payload.

const targetStr = `try {
    const listing = await prisma.listing.create({
      data: {
        ...parsed.data,`;

const replaceStr = `try {
    const listing = await prisma.listing.create({
      data: {
        ...parsed.data,
        isFeatured: Boolean((body as any)?.isFeatured),`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync(file, code);
console.log('patched route.ts');
