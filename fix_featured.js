const fs = require('fs');
let code = fs.readFileSync('src/components/home/featured-rail.tsx', 'utf8');
code = code.replace(/<img decoding="async" src=\{imgUrl\} alt=\{l\.title\} loading=\{i < 4 \? 'eager' : 'lazy'\}\s*decoding="async"/g, '<img decoding="async" src={imgUrl} alt={l.title} loading={i < 4 ? \'eager\' : \'lazy\'}');
fs.writeFileSync('src/components/home/featured-rail.tsx', code);
console.log('fixed featured');
