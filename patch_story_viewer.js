const fs = require('fs');
const file = 'src/components/stories/story-viewer.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/className="h-full w-full object-contain"/g, 'className="h-full w-full object-cover aspect-[9/16]"');

fs.writeFileSync(file, code);
console.log('patched story-viewer.tsx');
