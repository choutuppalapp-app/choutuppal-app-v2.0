const fs = require('fs');
let code = fs.readFileSync('src/components/stories/story-viewer.tsx', 'utf8');

// Import chevrons
code = code.replace(/import { X, Send, Eye, MessageCircle, Trash2, Loader2, Heart } from 'lucide-react'/,
    "import { X, Send, Eye, MessageCircle, Trash2, Loader2, Heart, ChevronLeft, ChevronRight } from 'lucide-react'");

// Replace the arrow buttons content.
// Instead of trying to match the weird encoding `?1` we can match the entire button content.
// Since we know what it looks like:
code = code.replace(/className="absolute left-2 top-1\/2 -translate-y-1\/2 text-white text-4xl cursor-pointer z-50"\s*>\s*[^<]*\s*<\/button>/g,
    `className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-50">\n          <ChevronLeft className="h-10 w-10" />\n        </button>`);

code = code.replace(/className="absolute right-2 top-1\/2 -translate-y-1\/2 text-white text-4xl cursor-pointer z-50"\s*>\s*[^<]*\s*<\/button>/g,
    `className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-50">\n          <ChevronRight className="h-10 w-10" />\n        </button>`);

fs.writeFileSync('src/components/stories/story-viewer.tsx', code);
console.log('patched story-viewer chevrons');
