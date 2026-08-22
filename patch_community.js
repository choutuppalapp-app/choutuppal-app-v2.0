const fs = require('fs');
const file = 'src/components/home/community-hub.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace card wrapper class
code = code.replace(
  /className="glass hover-lift relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300"/g,
  'className="relative flex flex-col overflow-hidden rounded-3xl p-6 glass hover-lift transition-all duration-300"'
);

// Replace icon containers
code = code.replace(
  /className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-\w+-500 to-\w+-500 text-white shadow-md"/g,
  'className="mb-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br from-blue-600 to-indigo-600"'
);

// Replace CTA Buttons
code = code.replace(
  /className="mt-5 w-full gap-1\.5 font-bold text-xs shadow-md bg-blue-600 text-white hover:bg-blue-700"/g,
  'className="mt-5 w-full gap-1.5 font-bold text-xs shadow-md gradient-brand text-white hover:opacity-90 border-0"'
);

fs.writeFileSync(file, code);
console.log('Patched community-hub.tsx');
