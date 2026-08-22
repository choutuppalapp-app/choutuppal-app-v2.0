const fs = require('fs');
const file = 'src/components/home/categories-grid.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '<div className="mt-4 flex overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-5 lg:grid-cols-10 pb-3 pt-1 scroll-smooth">',
  '<div className="flex overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-5 lg:grid-cols-10 mt-4">'
);

code = code.replace(
  /className="group flex w-\[90px\] md:w-auto shrink-0 flex-col items-center justify-between/g,
  'className="group flex shrink-0 w-20 md:w-auto flex-col items-center justify-between'
);

fs.writeFileSync(file, code);
