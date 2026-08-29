const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function fixUseClient() {
    let fixedCount = 0;
    walkDir('./src', (filePath) => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('"use client"') || content.includes("'use client'")) {
                let lines = content.split('\n');
                let useClientLineIndex = -1;
                let useClientLine = '';
                
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('"use client"') || lines[i].includes("'use client'")) {
                        useClientLineIndex = i;
                        useClientLine = lines[i];
                        break;
                    }
                }
                
                if (useClientLineIndex > 0) {
                    // It's not the first line. Remove it and prepend.
                    lines.splice(useClientLineIndex, 1);
                    lines.unshift(useClientLine);
                    fs.writeFileSync(filePath, lines.join('\n'));
                    fixedCount++;
                }
            }
        }
    });
    console.log(`Fixed 'use client' in ${fixedCount} files.`);
}

fixUseClient();
