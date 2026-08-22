const fs = require('fs');
let code = fs.readFileSync('src/components/explore/explore-grid.tsx', 'utf8');
code = code.replace(/<img decoding="async" loading="lazy"\s*decoding="async"/g, '<img decoding="async" loading="lazy"');
fs.writeFileSync('src/components/explore/explore-grid.tsx', code);
console.log('fixed explore');
