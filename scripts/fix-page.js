const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');
c = c.replace(/, \{ ssr: false, loading: \(\) => <div className="h-32 w-full animate-pulse bg-slate-100 rounded-xl"><\/div> \}/g, '');
fs.writeFileSync('src/app/page.tsx', c);
