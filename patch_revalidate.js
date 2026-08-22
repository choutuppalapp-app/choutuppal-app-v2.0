const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace revalidate = 0 with revalidate = 3600
code = code.replace(/export const revalidate = 0/g, 'export const revalidate = 3600');
fs.writeFileSync('src/app/page.tsx', code);
console.log('patched page.tsx revalidate');

try {
  let listingsCode = fs.readFileSync('src/app/listings/page.tsx', 'utf8');
  if(!listingsCode.includes('revalidate = 3600')) {
    listingsCode = listingsCode.replace(/export const dynamic = 'force-dynamic'/g, "export const revalidate = 3600");
    fs.writeFileSync('src/app/listings/page.tsx', listingsCode);
  }
} catch(e) {}
console.log('patched listings/page.tsx revalidate');
