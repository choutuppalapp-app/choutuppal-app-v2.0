const fs = require('fs');

function fix(file) {
    let code = fs.readFileSync(file, 'utf8');
    // For explore-grid.tsx:
    code = code.replace(/<img loading="lazy" decoding="async"\s*loading=\{.*?\}/g, '<img decoding="async" loading="lazy"');
    code = code.replace(/<img loading="lazy" decoding="async"\s*decoding="async"/g, '<img loading="lazy" decoding="async"');
    code = code.replace(/decoding="async"\s*decoding="async"/g, 'decoding="async"');
    fs.writeFileSync(file, code);
}

fix('src/components/explore/explore-grid.tsx');
fix('src/components/home/featured-rail.tsx');
console.log('fixed img tags in explore and featured');
