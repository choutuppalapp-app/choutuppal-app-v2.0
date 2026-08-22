const fs = require('fs');
const file = 'src/components/dashboard/add-listing-modal.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `const res = await fetch('/api/listings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title, description, coverImage: cover, logo, gallery: gallery.length ? gallery : undefined, phone, secondaryPhone: secondaryPhone || undefined, whatsapp, address, mapEmbed: mapLink, servicesCatalog: cleanServices.length ? cleanServices : undefined, businessHours: finalHours, categoryId: categoryId || undefined, villageId: villageId || undefined,
              }),
            })
            const json = await res.json()
            if (!res.ok || !json.ok) throw new Error(json.error || 'Failed')`;

const replacementStr = `const res = await fetch('/api/listings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title, description, coverImage: cover, logo, gallery: gallery.length ? gallery : undefined, phone, secondaryPhone: secondaryPhone || undefined, whatsapp, address, mapEmbed: mapLink, servicesCatalog: cleanServices.length ? cleanServices : undefined, businessHours: finalHours, categoryId: categoryId || undefined, villageId: villageId || undefined,
              }),
            })
            let json;
            try {
              json = await res.json()
            } catch (err) {
              console.error("API Parse Error:", err);
              throw new Error("Failed to submit listing. Please check all required fields.")
            }
            if (!res.ok || !json.ok) throw new Error(json?.error || 'Failed to create listing')`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync(file, code);
console.log('patched');
