const fs = require('fs');
const file = 'src/components/dashboard/add-listing-modal.tsx';
let code = fs.readFileSync(file, 'utf8');

// The replacement code block
const safeJsonBlock = `
            let json;
            try {
              json = await res.json()
            } catch (err) {
              console.error("API Parse Error:", err);
              throw new Error("Failed to submit listing. Please check all required fields.")
            }
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed')
`;

// Replace all instances
code = code.replace(/const json = await res\.json\(\)\s*if \(\!res\.ok \|\| \!json\.ok\) throw new Error\(json\.error \|\| 'Failed(?: to update)?'\)/g, safeJsonBlock.trim());

fs.writeFileSync(file, code);
console.log('Successfully patched add-listing-modal.tsx');
