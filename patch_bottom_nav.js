const fs = require('fs');
const file = 'src/components/home/bottom-nav.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/href="\/news"/g, 'href="/blog"');
code = code.replace(/isActive\('\/news'\)/g, 'isActive(\'/blog\')');

fs.writeFileSync(file, code);
console.log('patched bottom-nav.tsx');
