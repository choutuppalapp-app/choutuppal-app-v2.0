'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  Upload,
  Download,
  FolderPlus,
  RefreshCw,
  Loader2,
  Building2,
  User,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ContactsView() {
  const [contacts, setContacts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeGroup, setActiveGroup] = useState('all')
  const [loading, setLoading] = useState(true)

  // Pagination & Filtering State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Table Checkbox Selection
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set())

  // Modal States
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)

  const [groupOpen, setGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchContactsData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
        group: activeGroup
      })
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }

      const [resC, resCat] = await Promise.all([
        fetch(`/api/crm/contacts?${params.toString()}`),
        fetch('/api/crm/contacts/groups')
      ])

      if (resC.ok) {
        const jsonC = await resC.json()
        setContacts(jsonC.contacts || [])
        setTotalCount(jsonC.totalCount || 0)
        setTotalPages(jsonC.totalPages || 1)
      }
      
      if (resCat.ok) {
        const jsonCat = await resCat.json()
        setCategories(jsonCat.categories || [])
      }
    } catch {
      toast.error('Failed to load contacts data')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeGroup])

  useEffect(() => {
    fetchContactsData()
  }, [fetchContactsData])

  function togglePhone(phone: string) {
    const next = new Set(selectedPhones)
    if (next.has(phone)) next.delete(phone)
    else next.add(phone)
    setSelectedPhones(next)
  }

  function toggleSelectAll() {
    if (selectedPhones.size === contacts.length && contacts.length > 0) {
      setSelectedPhones(new Set())
    } else {
      setSelectedPhones(new Set(contacts.map((c) => c.phone)))
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      toast.error('Please enter a group name')
      return
    }
    if (selectedPhones.size === 0) {
      toast.error('Select at least 1 contact')
      return
    }
    setCreatingGroup(true)
    try {
      const res = await fetch('/api/admin/whatsapp/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          phoneNumbers: Array.from(selectedPhones),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create group')

      toast.success(`Group "${groupName}" created!`)
      setGroupOpen(false)
      setGroupName('')
      setSelectedPhones(new Set())
    } catch (err: any) {
      toast.error(err.message || 'Group creation failed')
    } finally {
      setCreatingGroup(false)
    }
  }

  async function handleImportCSV() {
    if (!csvText.trim()) {
      toast.error('Please provide CSV content')
      return
    }
    setImporting(true)
    try {
      const res = await fetch('/api/crm/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')

      toast.success(json.message || 'Imported successfully')
      setImportOpen(false)
      setCsvText('')
      fetchContactsData()
    } catch (err: any) {
      toast.error(err.message || 'Import error')
    } finally {
      setImporting(false)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) setCsvText(text)
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50/50 p-4 md:p-6 space-y-4 font-sans text-gray-900">
      
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4 bg-white p-5 rounded-2xl border shadow-xs">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            CRM Contacts Directory & Groups <Users className="h-5 w-5 text-emerald-600" />
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your leads, segment users into groups, and run targeted campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchContactsData()}
            disabled={loading}
            className="gap-2 border-gray-200 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <a href="/api/crm/contacts/export" download="Contacts.csv">
            <Button variant="outline" className="gap-2 border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs">
              <Download className="h-4 w-4 text-blue-600" /> Export CSV
            </Button>
          </a>

          <Button onClick={() => setImportOpen(true)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>

          {selectedPhones.size > 0 && (
            <Button
              onClick={() => setGroupOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              <FolderPlus className="h-4 w-4" /> Create Group ({selectedPhones.size})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar Box */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-1/2 lg:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or tags..."
            className="pl-9 h-10 border-gray-200 bg-gray-50 focus:bg-white text-sm"
          />
        </div>

        {/* Dynamic Group Pills */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 items-center">
          <button
            onClick={() => { setActiveGroup('all'); setPage(1); }}
            className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition", activeGroup === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
          >
            All Contacts
          </button>
          <button
            onClick={() => { setActiveGroup('emergency'); setPage(1); }}
            className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition", activeGroup === 'emergency' ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-700 hover:bg-rose-100')}
          >
            Emergency & Govt
          </button>
          <button
            onClick={() => { setActiveGroup('business'); setPage(1); }}
            className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition", activeGroup === 'business' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-50 text-purple-700 hover:bg-purple-100')}
          >
            Business Owners
          </button>
          <button
            onClick={() => { setActiveGroup('customer'); setPage(1); }}
            className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition", activeGroup === 'customer' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-700 hover:bg-blue-100')}
          >
            Customers
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1 shrink-0" />

          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setActiveGroup(`category:${cat.name}`); setPage(1); }}
              className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition border", activeGroup === `category:${cat.name}` ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Contacts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase font-extrabold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedPhones.size === contacts.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">User Type</th>
                <th className="p-4">Lead Tag</th>
                <th className="p-4">Date of Birth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-emerald-600" /> Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-gray-400">
                    No contacts found in this group.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const isSelected = selectedPhones.has(c.phone)
                  return (
                    <tr key={c.id || c.phone} className={cn("transition", isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50')}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePhone(c.phone)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 text-gray-700 font-black text-xs">
                          {(c.name || c.phone).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[200px]">{c.name || 'Unnamed Contact'}</span>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-600">{c.phone}</td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
                          c.userType === 'business_owner' ? 'bg-purple-100 text-purple-800' :
                          c.userType === 'emergency_govt_leader' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {c.userType === 'business_owner' && <><Building2 className="h-3 w-3" /> Business</>}
                          {c.userType === 'emergency_govt_leader' && <><Sparkles className="h-3 w-3" /> Leader / Govt</>}
                          {c.userType === 'customer' && <><User className="h-3 w-3" /> Customer</>}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="rounded bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700 border border-gray-200">
                          {c.tag || 'General'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-gray-600">
                        {c.dateOfBirth ? (
                          <span className="flex items-center gap-1.5 text-indigo-700">
                            <Calendar className="h-3.5 w-3.5" /> {c.dateOfBirth}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-4">
          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{contacts.length}</strong> of <strong className="text-gray-900">{totalCount}</strong> contacts (Page {page} of {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="h-8 gap-1 border-gray-200 text-xs font-bold text-gray-700 bg-white"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="h-8 gap-1 border-gray-200 text-xs font-bold text-gray-700 bg-white"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="h-5 w-5 text-emerald-600" /> Import Contacts CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Format: `phone_number, name, user_type` per line.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Upload File</label>
              <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="text-xs border-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Or Paste Text</label>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="+919876543210, Ramesh, business_owner"
                rows={5}
                className="border-gray-200 text-xs font-mono"
              />
            </div>
            <Button onClick={handleImportCSV} disabled={importing || !csvText.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-md">
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FolderPlus className="h-5 w-5 text-indigo-600" /> Save Contact Group
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Create a reusable segment with {selectedPhones.size} contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Group Name *</label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. VIP Customers" className="border-gray-200" />
            </div>
            <Button onClick={handleCreateGroup} disabled={creatingGroup || !groupName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md">
              {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} Save Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
