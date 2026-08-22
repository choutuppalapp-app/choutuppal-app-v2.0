const fs = require('fs');
const file = 'src/lib/home-data.ts';
let code = fs.readFileSync(file, 'utf8');

// I need to add phone, whatsapp to the getFeaturedListings select
const regex = /id: true,\s*title: true,\s*slug: true,\s*coverImage: true,\s*logo: true,\s*avgRating: true,\s*views: true,\s*isFeatured: true,\s*villageId: true,\s*categoryId: true,\s*category: \{ select: \{ id: true, name: true, slug: true \} \},\s*village: \{ select: \{ id: true, name: true, slug: true \} \},/g;
const replace = `id: true,
            title: true,
            slug: true,
            coverImage: true,
            logo: true,
            phone: true,
            whatsapp: true,
            avgRating: true,
            views: true,
            isFeatured: true,
            villageId: true,
            categoryId: true,
            category: { select: { id: true, name: true, slug: true } },
            village: { select: { id: true, name: true, slug: true } },`;

code = code.replace(regex, replace);

fs.writeFileSync(file, code);
console.log('patched home-data.ts for featured listing fields');
