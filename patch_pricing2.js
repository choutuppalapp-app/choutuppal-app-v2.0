const fs = require('fs');
const file = 'src/components/home/pricing-plans.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace card wrapper class
code = code.replace(
  /className=\{cn\([\s\S]*?'relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300',[\s\S]*?p\.highlight[\s\S]*?\? 'glass-strong ring-2 ring-purple-500 shadow-xl scale-\[1\.02\]'[\s\S]*?: 'glass hover-lift hover:border-blue-300',[\s\S]*?\)\}/,
  'className="relative flex flex-col overflow-hidden rounded-3xl p-6 glass hover-lift transition-all duration-300"'
);

// Replace icon container
code = code.replace(
  /<div\s*className=\{cn\([\s\S]*?'mb-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md',[\s\S]*?p\.grad,[\s\S]*?\)\}\s*>/,
  '<div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br from-blue-600 to-indigo-600">'
);

// Replace CTA Button
code = code.replace(
  /<Button\s*asChild\s*className=\{cn\([\s\S]*?'mt-5 w-full gap-1\.5 font-bold text-xs shadow-md',[\s\S]*?p\.highlight[\s\S]*?\? 'gradient-brand text-white'[\s\S]*?: 'bg-blue-600 text-white hover:bg-blue-700',[\s\S]*?\)\}\s*>/,
  '<Button asChild className="mt-5 w-full gap-1.5 font-bold text-xs shadow-md gradient-brand text-white hover:opacity-90 border-0">'
);

fs.writeFileSync(file, code);
