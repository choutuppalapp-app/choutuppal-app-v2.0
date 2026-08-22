const fs = require('fs');

function fixStories() {
    let code = fs.readFileSync('src/app/api/stories/route.ts', 'utf8');
    
    const target = `  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  const story = await prisma.story.create({
    data: { ...parsed.data, expiresAt, ownerId: auth.user.id },
  })
  return NextResponse.json({ ok: true, story }, { status: 201 })`;
  
    const replacement = `  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  try {
    const story = await prisma.story.create({
      data: { ...parsed.data, expiresAt, ownerId: auth.user.id },
    })
    return NextResponse.json({ ok: true, story }, { status: 201 })
  } catch (err: any) {
    console.error('Story Creation Error:', err)
    return NextResponse.json({ error: err.message || 'Database error occurred while saving' }, { status: 500 })
  }`;
  
    code = code.replace(/const body = await request\.json\(\)\.catch\(\(\) => \(\{\}\)\)/, `let body: unknown;
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }`);

    code = code.replace(target, replacement);
    fs.writeFileSync('src/app/api/stories/route.ts', code);
    console.log('patched stories api');
}

fixStories();
