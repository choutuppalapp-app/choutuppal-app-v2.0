const fs = require('fs');
const file = 'src/components/crm/contacts-view.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Remove lines 41, 42, 43
// Wait, array is 0 indexed. Let's do string replacement instead for safety.
let code = lines.join('\n');

// Clean duplicate states
code = code.replace(
  `  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('all')`,
  `  const [debouncedSearch, setDebouncedSearch] = useState('')`
);

// Remove the Select dropdowns that are causing errors because their variables don't exist
const toRemove = `          {/* User Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val as any)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 border-gray-200 bg-white text-xs text-gray-900 rounded-lg w-44">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-xs">
              <SelectItem value="all">All User Types</SelectItem>
              <SelectItem value="customer">Customers Only</SelectItem>
              <SelectItem value="business_owner">Business Owners Only</SelectItem>
              <SelectItem value="emergency_govt_leader">Emergency & Govt Leaders</SelectItem>
            </SelectContent>
          </Select>

          {/* Group Filter */}
          <Select
            value={groupFilter}
            onValueChange={(val) => {
              setGroupFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 border-gray-200 bg-white text-xs text-gray-900 rounded-lg w-44">
              <SelectValue placeholder="Group Filter" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-xs">
              <SelectItem value="all">All Contact Groups</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  📁 {g.name} ({g._count?.contacts || g.contacts?.length || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>`;

code = code.replace(toRemove, "");

fs.writeFileSync(file, code);
console.log('Fixed syntax errors');
