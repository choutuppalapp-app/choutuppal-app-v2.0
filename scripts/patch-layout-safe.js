const fs = require('fs');
let c = fs.readFileSync('src/app/layout.tsx', 'utf8');
c = c.replace(/<img\b/g, '<Image width={1} height={1}');
c = c.replace('height="1"', '');
c = c.replace('width="1"', '');
if (!c.includes('import Image from')) {
    c = `import Image from 'next/image';\n` + c;
}
fs.writeFileSync('src/app/layout.tsx', c);
