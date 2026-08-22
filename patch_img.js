const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    if (code.includes('<img')) {
        // Simple but safe replacement: look for <img without loading= or decoding=
        // We'll replace <img with <img loading="lazy" decoding="async"
        // Wait, if it already has it, we might double it up.
        // Let's do a smarter replace.
        code = code.replace(/<img(?![^>]*loading=["']lazy["'])/g, '<img loading="lazy" decoding="async"');
        
        // Remove duplicate decoding="async" if we injected it but it already existed
        code = code.replace(/decoding="async"\s+decoding="async"/g, 'decoding="async"');
        fs.writeFileSync(file, code);
    }
});
console.log('patched img tags');
