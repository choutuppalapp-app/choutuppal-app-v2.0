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
  Phone,
  Calendar,
  Tag,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function ContactsView() {
  const [contacts, setContacts] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
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
      let url = `/api/crm/contacts?page=${page}&limit=50`
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`
      
      if (activeFilter === 'emergency_govt_leader') {
        url += `&groupId=emergency_govt_leader`
      } else if (activeFilter !== 'all') {
        url += `&category=${activeFilter}`
      }

      const [resC, resG, resCat] = await Promise.all([
        fetch(url),
        fetch('/api/admin/whatsapp/groups'),
        fetch('/api/categories')
      ])
      
      const jsonC = await resC.json()
      if (resG.ok) {
        const jsonG = await resG.json()
        setGroups(jsonG.groups || [])
      }
      if (resCat.ok) {
        const jsonCat = await resCat.json()
        setCategories(jsonCat.categories || jsonCat || [])
      }

      if (resC.ok) {
        setContacts(jsonC.contacts || [])
        setTotalCount(jsonC.totalCount || 0)
        setTotalPages(jsonC.totalPages || 1)
      }
    } catch {
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, activeFilter])

  useEffect(() => {
    fetchContactsData()
  }, [fetchContactsData])

  function togglePhone(phone: string) {
    const next = new Set(selectedPhones)
    if (next.has(phone)) {
      next.delete(phone)
    } else {
      next.add(phone)
    }
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
      toast.error('Select at least 1 contact to add to the group')
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

      toast.success(`Group "${groupName}" created with ${selectedPhones.size} contacts!`)
      setGroupOpen(false)
      setGroupName('')
      fetchContactsData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Group creation failed')
    } finally {
      setCreatingGroup(false)
    }
  }

  async function handleImportCSV() {
    if (!csvText.trim()) {
      toast.error('Please enter or paste CSV content')
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

      toast.success(json.message || `Imported contacts successfully!`)
      setImportOpen(false)
      setCsvText('')
      fetchContactsData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import error')
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
      if (text) {
        setCsvText(text)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            CRM Contacts Directory & Groups <Users className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Manage WhatsApp leads, create target groups, and import/export CSV contact databases.
          </p>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchContactsData()}
            disabled={loading}
            className="gap-1.5 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          {/* Export CSV Download Link */}
          <a href="/api/crm/contacts/export" download="Choutuppal_CRM_Contacts.csv">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs h-8"
              title="Export all contacts to CSV file"
            >
              <Download className="h-3.5 w-3.5 text-blue-600" /> Export CSV
            </Button>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs h-8"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-600" /> Import CSV
          </Button>

          <Button
            onClick={() => {
              if (selectedPhones.size === 0) {
                toast.error('Please select at least 1 contact to create group')
                return
              }
              setGroupOpen(true)
            }}
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs"
          >
            <FolderPlus className="h-3.5 w-3.5" /> Create Group ({selectedPhones.size})
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Box */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[300px]">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, or tags..."
              className="pl-8 h-8 text-xs border-gray-200 bg-white rounded-lg"
            />
          </div>


        </div>

        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
          Showing {contacts.length} of {totalCount} Contacts (Page {page} of {totalPages})
        </span>
      </div>

      {/* Main Contacts Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 font-sans">
            <thead className="bg-gray-50/80 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedPhones.size === contacts.length}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Contact Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">User Type</th>
                <th className="p-3">Lead Tag</th>
                <th className="p-3">Date of Birth</th>
                <th className="p-3 rounded-r-lg">Date Added</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" /> Loading contacts database...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-400">
                    No contacts match the selected search or group filter.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const isSelected = selectedPhones.has(c.phone)
                  return (
                    <tr
                      key={c.id || c.phone}
                      className={`transition ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePhone(c.phone)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                          {(c.name || c.phone).slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[160px]">{c.name || 'WhatsApp Contact'}</span>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-gray-600">{c.phone}</td>

                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                            c.userType === 'business_owner'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : c.userType === 'emergency_govt_leader'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {c.userType === 'business_owner' ? (
                            <>
                              <Building2 className="h-3 w-3" /> Business
                            </>
                          ) : c.userType === 'emergency_govt_leader' ? (
                            <>
                              <Sparkles className="h-3 w-3 text-amber-600" /> Leader/Govt
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3" /> Customer
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200">
                          {c.tag || 'General'}
                        </span>
                      </td>

                      <td className="p-3 text-[11px] text-gray-600 font-medium">
                        {c.dateOfBirth ? (
                          <span className="flex items-center gap-1 text-purple-700">
                            <Calendar className="h-3 w-3" /> {c.dateOfBirth}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="p-3 text-[10px] text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Controls Bar */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/80 px-4 py-3">
          <span className="text-xs text-gray-500 font-medium">
            Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({totalCount} total contacts)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="gap-1 border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 h-8"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="gap-1 border-gray-200 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 h-8"
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
              <Upload className="h-5 w-5 text-emerald-600" /> Import Contacts from CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Upload a `.csv` file or paste text formatted as `phone, name, user_type` per line.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Choose CSV File</label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="text-xs border-gray-200 bg-white cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Or Paste CSV Text</label>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`+919876543210, Ramesh, business_owner\n9988776655, Suresh, customer`}
                rows={6}
                className="border-gray-200 bg-white text-xs font-mono"
              />
            </div>

            <Button
              onClick={handleImportCSV}
              disabled={importing || !csvText.trim()}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Bulk Upsert Contacts
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <Dialog open={groupOpen} onOpenChange={setGroupOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FolderPlus className="h-5 w-5 text-emerald-600" /> Create Contact Group
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Save {selectedPhones.size} selected contacts into a reusable target group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Group Name *</label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Real Estate Agents"
                className="h-9 text-xs border-gray-200 bg-white"
              />
            </div>

            <Button
              onClick={handleCreateGroup}
              disabled={creatingGroup || !groupName.trim()}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
            >
              {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} Save Group to Database
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
