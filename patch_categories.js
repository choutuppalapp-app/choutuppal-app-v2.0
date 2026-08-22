const fs = require('fs');
const file = 'src/components/home/categories-grid.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /className="flex overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-5 lg:grid-cols-10 mt-4"/;
const replace = `className="flex overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-10 mt-4"`;

code = code.replace(regex, replace);

fs.writeFileSync(file, code);
console.log('patched categories grid');
