const fs = require('fs');

function wrapTryCatch(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    // For POST method in route.ts, it typically looks like:
    // const expiresAt = new Date(...)
    // const banner = await prisma.banner.create({ ... })
    // return NextResponse.json(...)
    
    // Let's replace prisma.xxx.create with try/catch. We'll do a regex block replacement.
    // However, the easiest is to just find the `await prisma.<model>.create(` and wrap it.
    
    // Instead of complex regex, let's just do a specific string replace for each file to ensure it's exact.
}

function fixBanners() {
    let code = fs.readFileSync('src/app/api/banners/route.ts', 'utf8');
    
    const target = `  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  const banner = await prisma.banner.create({
    data: { ...parsed.data, expiresAt, ownerId: auth.user.id, tenantId: tenant.id },
  })
  return NextResponse.json({ ok: true, banner }, { status: 201 })`;
  
    const replacement = `  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  try {
    const banner = await prisma.banner.create({
      data: { ...parsed.data, expiresAt, ownerId: auth.user.id, tenantId: tenant.id },
    })
    return NextResponse.json({ ok: true, banner }, { status: 201 })
  } catch (err: any) {
    console.error('Banner Creation Error:', err)
    return NextResponse.json({ error: err.message || 'Database error occurred while saving' }, { status: 500 })
  }`;
  
    // And for request.json()
    code = code.replace(/const body = await request\.json\(\)\.catch\(\(\) => \(\{\}\)\)/, `let body: unknown;
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }`);

    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/api/banners/route.ts', code);
    console.log('patched banners api');
}

fixBanners();
