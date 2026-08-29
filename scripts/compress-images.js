const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

async function processDirectory(dir, replacements) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      await processDirectory(filePath, replacements);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const parsedPath = path.parse(filePath);
        const newFilePath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
        const newFileName = `${parsedPath.name}.webp`;
        
        try {
          console.log(`Optimizing: ${filePath}`);
          await sharp(filePath)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(newFilePath);
          
          fs.unlinkSync(filePath); // delete original
          
          // Track replacement for codebase update
          const oldRef = file;
          const newRef = newFileName;
          if (oldRef !== newRef) {
             replacements.push({ oldRef, newRef });
          }
        } catch (err) {
          console.error(`Failed to optimize ${filePath}:`, err);
        }
      }
    }
  }
}

function updateReferences(dir, replacements) {
    if (replacements.length === 0) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            updateReferences(filePath, replacements);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            for (const r of replacements) {
                // simple replace for string occurrences like "logo.png" -> "logo.webp"
                const regex = new RegExp(r.oldRef.replace(/\./g, '\\.'), 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, r.newRef);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(filePath, content);
                console.log(`Updated references in ${filePath}`);
            }
        }
    }
}

async function run() {
  const replacements = [];
  const publicDir = path.join(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
      await processDirectory(publicDir, replacements);
  }
  
  const srcDir = path.join(__dirname, '../src');
  if (fs.existsSync(srcDir)) {
      updateReferences(srcDir, replacements);
  }
  
  // also update appSettings in page.tsx if there's any reference?
  // the above recursive function will catch it since it scans src/
  
  console.log('Image compression and reference updates complete.');
}

run();
