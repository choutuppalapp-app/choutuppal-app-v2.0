const fs = require('fs');
let code = fs.readFileSync('src/components/stories/story-viewer.tsx', 'utf8');

// 1. Outer wrapper is fine: "fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
code = code.replace(/className="fixed inset-0 z-\[100\] flex items-center justify-center bg-black\/90 backdrop-blur-sm"/, 
    'className="fixed inset-0 z-50 h-screen w-screen bg-black flex items-center justify-center"');

// 2. The inner container:
code = code.replace(/<div\s+className="relative h-full w-full max-w-md"/, 
    '<div className="relative h-full w-full max-w-md overflow-hidden bg-black md:relative md:inset-auto md:h-[80vh] md:rounded-2xl"');

// 3. Close button
// It's currently: className="absolute right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
code = code.replace(/className="absolute right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-white\/10 text-white transition hover:bg-white\/20"/,
    'className="absolute top-4 right-4 text-white text-3xl z-50 cursor-pointer"');

// 4. Media
code = code.replace(/className="h-full w-full object-cover aspect-\[9\/16\]"/g, 'className="h-full w-full object-contain"');

// 5. Navigation arrows (remove 'hidden md:grid')
code = code.replace(/className="absolute left-2 top-1\/2 z-30 hidden h-10 w-10 -translate-y-1\/2 place-items-center rounded-full bg-white\/10 text-white hover:bg-white\/20 md:grid"/,
    'className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-50"');

code = code.replace(/className="absolute right-2 top-1\/2 z-30 hidden h-10 w-10 -translate-y-1\/2 place-items-center rounded-full bg-white\/10 text-white hover:bg-white\/20 md:grid"/,
    'className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-50"');

// 6. Navigation logic - when click right and it's the last story, close.
// Currently it does: onClick={() => setIndex((i) => Math.min(stories.length - 1, i + 1))}
code = code.replace(/onClick=\{\(\) => setIndex\(\(i\) => Math\.min\(stories\.length - 1, i \+ 1\)\)\}/, 
    'onClick={() => { if (index < stories.length - 1) setIndex(index + 1); else onClose(); }}');
// Notice: there's a `{index < stories.length - 1 ? (` block preventing it from showing on the last story.
// We need to change `{index < stories.length - 1 ? (` to just `{true ? (` so it always shows the right arrow and can close.
code = code.replace(/\{index < stories\.length - 1 \? \(/, '{true ? (');

fs.writeFileSync('src/components/stories/story-viewer.tsx', code);
console.log('patched story-viewer.tsx');
