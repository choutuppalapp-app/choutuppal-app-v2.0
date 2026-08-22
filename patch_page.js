const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/\/\ /g, '').replace(/F o r c e   U p d a t e/g, '').trim();
code += '\n\n// Force Update\n';
fs.writeFileSync(file, code);
console.log('patched');
