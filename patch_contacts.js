const fs = require('fs');
const file = 'src/components/crm/contacts-view.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. State declarations
code = code.replace(
  "const [groups, setGroups] = useState<any[]>([])",
  "const [groups, setGroups] = useState<any[]>([])\n  const [categories, setCategories] = useState<any[]>([])\n  const [activeFilter, setActiveFilter] = useState('all')"
);
code = code.replace(
  "const [activeGroup, setActiveGroup] = useState('all')\n  const [activeUserType, setActiveUserType] = useState('all')",
  ""
);

// 2. Fetch categories
code = code.replace(
  "const resGroup = await fetch('/api/admin/whatsapp/groups')",
  "const resGroup = await fetch('/api/admin/whatsapp/groups')\n      const resCat = await fetch('/api/categories')\n      if (resCat.ok) { const catData = await resCat.json(); setCategories(catData.categories || catData); }"
);

// 3. Fetch URL logic
code = code.replace(
  "if (activeGroup !== 'all') url += `&groupId=${activeGroup}`\n      if (activeUserType !== 'all') url += `&userType=${activeUserType}`",
  "if (activeFilter === 'emergency_govt_leader') url += `&groupId=emergency_govt_leader`\n      else if (activeFilter !== 'all') url += `&category=${activeFilter}`"
);

// 4. Dependency array
code = code.replace(
  "[page, searchDebounced, activeGroup, activeUserType]",
  "[page, searchDebounced, activeFilter]"
);

// 5. The Search Bar and Filter Selectors
const searchBarRegex = /<div className="flex flex-col gap-3 sm:flex-row sm:items-center">[\s\S]*?<div className="relative flex-1">[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const newSearchBar = `<div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, phone or tag..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-9 text-xs border-gray-200 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            {selectedPhones.size > 0 && (
              <Button
                onClick={() => setGroupOpen(true)}
                variant="outline"
                className="h-9 gap-2 text-xs font-bold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              >
                <FolderPlus className="h-4 w-4" /> Save as Group ({selectedPhones.size})
              </Button>
            )}
            <Button
              onClick={() => setImportOpen(true)}
              className="h-9 gap-2 text-xs font-bold bg-gray-900 text-white hover:bg-gray-800"
            >
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
          </div>
          
          {/* Dynamic Filter Pills */}
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            <button
              onClick={() => { setActiveFilter('all'); setPage(1); }}
              className={\`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition \${activeFilter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
            >
              All Contacts
            </button>
            <button
              onClick={() => { setActiveFilter('emergency_govt_leader'); setPage(1); }}
              className={\`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition \${activeFilter === 'emergency_govt_leader' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}\`}
            >
              Emergency & Leaders
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug || cat.id}
                onClick={() => { setActiveFilter(cat.slug); setPage(1); }}
                className={\`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition \${activeFilter === cat.slug ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>`;

code = code.replace(searchBarRegex, newSearchBar);
fs.writeFileSync(file, code);
console.log('Patched contacts-view.tsx');
