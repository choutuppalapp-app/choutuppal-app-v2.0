const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processImages() {
    let replacedCount = 0;
    walkDir('./src', (filePath) => {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('<img ')) {
                // Check if Image is already imported
                let hasImageImport = content.includes("import Image from 'next/image'") || content.includes('import Image from "next/image"');
                
                // Add loading="lazy" if not present, and width/height
                // Using regex to replace <img with <Image width={800} height={800} loading="lazy"
                // But wait, what if loading is already there?
                // Just let Next.js Image component handle it (it defaults to lazy!)
                // And replace <img with <Image width={800} height={800}
                
                let newContent = content.replace(/<img\b/g, '<Image width={800} height={800}');
                
                if (!hasImageImport && newContent !== content) {
                    newContent = `import Image from 'next/image';\n` + newContent;
                }
                
                fs.writeFileSync(filePath, newContent);
                replacedCount++;
            }
        }
    });
    console.log(`Replaced images in ${replacedCount} files.`);
}

function optimizeDynamicImports() {
    const pagePath = './src/app/page.tsx';
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');
        content = content.replace(
            /nextDynamic\(\(\) => import\('([^']+)'\)\.then\(m => \(\{\s*default:\s*m\.([^}]+)\s*\}\)\)\)/g,
            "nextDynamic(() => import('$1').then(m => ({ default: m.$2 })), { ssr: false, loading: () => <div className=\"h-32 w-full animate-pulse bg-slate-100 rounded-xl\"></div> })"
        );
        fs.writeFileSync(pagePath, content);
        console.log('Optimized src/app/page.tsx dynamic imports');
    }
    
    const crmPagePath = './src/app/crm/page.tsx';
    if (fs.existsSync(crmPagePath)) {
        let content = fs.readFileSync(crmPagePath, 'utf8');
        // Add dynamic imports for charts
        if (!content.includes('next/dynamic')) {
            content = "import nextDynamic from 'next/dynamic';\n" + content;
            
            // Replace static imports with dynamic ones
            const heavyComponents = [
                'ConversationsChart',
                'PipelineDonut',
                'ResponseTimeChart',
                'ActivityFeed'
            ];
            
            heavyComponents.forEach(comp => {
                const regex = new RegExp(`import { ${comp} } from '([^']+)'`, 'g');
                content = content.replace(regex, `const ${comp} = nextDynamic(() => import('$1').then(m => ({ default: m.${comp} })), { ssr: false, loading: () => <div className="h-64 w-full animate-pulse bg-slate-100 rounded-xl"></div> })`);
            });
            fs.writeFileSync(crmPagePath, content);
            console.log('Optimized src/app/crm/page.tsx dynamic imports');
        }
    }
}

processImages();
optimizeDynamicImports();
