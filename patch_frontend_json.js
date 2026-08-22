const fs = require('fs');

function patchFile(file) {
    try {
        let code = fs.readFileSync(file, 'utf8');
        
        // Find raw await res.json()
        const target = /const\s+(\w+)\s*=\s*await\s+res\.json\(\)/g;
        
        // Replace with the safe wrapper
        const replaceStr = `let $1;
        try {
          $1 = await res.json()
        } catch (err) {
          console.error("API Parse Error:", err);
          throw new Error("Failed to submit. Please check all required fields and try again.")
        }`;
        
        code = code.replace(target, replaceStr);
        fs.writeFileSync(file, code);
        console.log('patched ' + file);
    } catch (e) {
        console.log('could not patch ' + file + ':', e.message);
    }
}

patchFile('src/components/dashboard/banner-creator.tsx');
patchFile('src/components/stories/story-creator.tsx');
patchFile('src/components/dashboard/add-listing-modal.tsx');
