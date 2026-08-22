const fs = require('fs');
const file = 'src/app/api/admin/listings/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(typeof isFeatured === 'boolean'\) dataToUpdate\.isFeatured = isFeatured/g,
  `if (isFeatured !== undefined) dataToUpdate.isFeatured = (isFeatured === 'true' || isFeatured === true)`
);

fs.writeFileSync(file, code);
console.log('patched admin patch route');
