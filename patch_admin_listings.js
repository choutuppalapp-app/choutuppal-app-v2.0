const fs = require('fs');
const file = 'src/app/api/admin/listings/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const body = await request\.json\(\)/g,
  "let body: any;\ntry {\n  body = await request.json()\n} catch {\n  return NextResponse.json({ ok: false, error: 'Invalid JSON data' }, { status: 400 })\n}"
);

fs.writeFileSync(file, code);
console.log('patched');
