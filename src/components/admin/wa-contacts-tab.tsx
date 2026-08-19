'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users,
  UserPlus,
  Upload,
  Download,
  FolderPlus,
  Trash2,
  Search,
  CheckCircle2,
  Loader2,
  Tag,
  Phone,
  Plus,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export interface WhatsAppContactItem {
  id: string
  name: string
  phone: string
  source?: string
  groups: { id: string; name: string }[]
  createdAt: string
}

export interface ContactGroupItem {
  id: string
  name: string
  _count?: { contacts: number }
}

export function WAContactsTab() {
  const [contacts, setContacts] = useState<WhatsAppContactItem[]>([])
  const [groups, setGroups] = useState<ContactGroupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL')

  // Form State (Single Contact Add)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [savingContact, setSavingContact] = useState(false)

  // Group Creation State
  const [newGroupName, setNewGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)

  // Bulk Selection State
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [bulkAssignGroupId, setBulkAssignGroupId] = useState<string>('')
  const [importingCsv, setImportingCsv] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [resContacts, resGroups] = await Promise.all([
        fetch('/api/admin/whatsapp/contacts'),
        fetch('/api/admin/whatsapp/groups'),
      ])

      const dataContacts = await resContacts.json()
      const dataGroups = await resGroups.json()

      if (dataContacts.ok) setContacts(dataContacts.contacts || [])
      if (dataGroups.ok) setGroups(dataGroups.groups || [])
    } catch (err) {
      toast.error('Failed to load contacts data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and Phone Number are required.')
      return
    }

    try {
      setSavingContact(true)
      const res = await fetch('/api/admin/whatsapp/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          groupIds: selectedGroupIds,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to save contact')

      toast.success(`Contact ${data.contact.name} saved successfully!`)
      setName('')
      setPhone('')
      setSelectedGroupIds([])
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save contact')
    } finally {
      setSavingContact(false)
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      setCreatingGroup(true)
      const res = await fetch('/api/admin/whatsapp/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to create group')

      toast.success(`Group "${data.group.name}" created!`)
      setNewGroupName('')
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create group')
    } finally {
      setCreatingGroup(false)
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const res = await fetch(`/api/admin/whatsapp/groups?id=${groupId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete group')

      toast.success('Group deleted successfully.')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete group.')
    }
  }

  function handleCsvFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImportingCsv(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const res = await fetch('/api/admin/whatsapp/contacts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvText: text }),
        })

        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to import CSV')

        toast.success(`CSV Import Complete! ${data.insertedCount} new contacts added, ${data.updatedCount} updated.`)
        fetchData()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'CSV import failed')
      } finally {
        setImportingCsv(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  function handleExportCsv() {
    if (contacts.length === 0) {
      toast.error('No contacts available to export.')
      return
    }

    let csvContent = 'data:text/csv;charset=utf-8,Name,Phone,Source,Groups\n'
    contacts.forEach((c) => {
      const groupNames = c.groups.map((g) => g.name).join(';')
      csvContent += `"${c.name}","${c.phone}","${c.source || 'manual'}","${groupNames}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `whatsapp_contacts_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function handleBulkAssignGroup() {
    if (selectedContactIds.length === 0 || !bulkAssignGroupId) {
      toast.error('Select contacts and a target group.')
      return
    }

    try {
      const targetContacts = contacts.filter((c) => selectedContactIds.includes(c.id))
      for (const c of targetContacts) {
        const currentGroupIds = c.groups.map((g) => g.id)
        if (!currentGroupIds.includes(bulkAssignGroupId)) {
          await fetch('/api/admin/whatsapp/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: c.name,
              phone: c.phone,
              groupIds: [...currentGroupIds, bulkAssignGroupId],
            }),
          })
        }
      }

      toast.success(`Assigned ${selectedContactIds.length} contacts to group.`)
      setSelectedContactIds([])
      setBulkAssignGroupId('')
      fetchData()
    } catch (err) {
      toast.error('Failed to assign contacts to group.')
    }
  }

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
    const matchesGroup =
      selectedGroupFilter === 'ALL' || c.groups.some((g) => g.id === selectedGroupFilter)
    return matchesSearch && matchesGroup
  })

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>WhatsApp Contact Manager</span>
          </h2>
          <p className="text-xs text-slate-500">
            Manage leads, create audience groups, and import/export CSV lists for targeted campaigns.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* CSV Import Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCsvFileUpload}
            accept=".csv,.txt"
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importingCsv}
            className="gap-1.5 text-xs font-bold border-slate-300"
          >
            {importingCsv ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-emerald-600" />}
            <span>Import CSV</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 text-xs font-bold border-slate-300"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export CSV</span>
          </Button>

          {/* Group Manager Dialog */}
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" className="gap-1.5 text-xs font-bold bg-slate-900 text-white">
                <FolderPlus className="h-3.5 w-3.5 text-amber-400" />
                <span>Manage Groups ({groups.length})</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Contact Groups Manager</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Create Group Form */}
                <form onSubmit={handleCreateGroup} className="flex gap-2">
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="New Group Name (e.g. RealEstate Buyers)..."
                    className="text-xs"
                  />
                  <Button type="submit" disabled={creatingGroup} className="bg-blue-600 text-white text-xs shrink-0">
                    {creatingGroup ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    <span>Create</span>
                  </Button>
                </form>

                {/* Group List */}
                <div className="max-h-60 overflow-y-auto divide-y border rounded-2xl p-2 bg-slate-50">
                  {groups.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No groups created yet.</p>
                  ) : (
                    groups.map((g) => (
                      <div key={g.id} className="flex items-center justify-between py-2 px-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{g.name}</span>
                          <span className="ml-2 text-[10px] text-slate-500">({g._count?.contacts || 0} members)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-500"
                          onClick={() => handleDeleteGroup(g.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Manual Contact Add Form (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span>Add Single Contact</span>
          </h3>

          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Contact Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">WhatsApp Phone Number *</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919494348175"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Assign Groups (Optional)</Label>
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
                {groups.length === 0 ? (
                  <p className="text-[11px] text-slate-400">No groups available. Create one above.</p>
                ) : (
                  groups.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 py-1 px-1 cursor-pointer hover:bg-slate-100 rounded">
                      <Checkbox
                        checked={selectedGroupIds.includes(g.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedGroupIds([...selectedGroupIds, g.id])
                          else setSelectedGroupIds(selectedGroupIds.filter((id) => id !== g.id))
                        }}
                      />
                      <span className="text-slate-800 font-medium">{g.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button type="submit" disabled={savingContact} className="w-full gap-2 bg-blue-600 text-white font-bold">
              {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span>Save Contact</span>
            </Button>
          </form>
        </div>

        {/* Right Column: Contacts Table & Bulk Operations (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          {/* Table Filters & Bulk Assign Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or phone..."
                  className="pl-8 text-xs h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                <SelectTrigger className="h-9 w-[160px] text-xs font-semibold">
                  <SelectValue placeholder="Filter Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Groups</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Group Assign Ribbon */}
          {selectedContactIds.length > 0 && (
            <div className="flex items-center justify-between rounded-2xl bg-blue-50 border border-blue-200 p-3 text-xs">
              <span className="font-bold text-blue-900">{selectedContactIds.length} contacts selected</span>
              <div className="flex items-center gap-2">
                <Select value={bulkAssignGroupId} onValueChange={setBulkAssignGroupId}>
                  <SelectTrigger className="h-8 text-xs bg-white w-40">
                    <SelectValue placeholder="Add to Group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleBulkAssignGroup} className="h-8 bg-blue-600 text-white font-bold text-xs">
                  Apply
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-8">
                    <Checkbox
                      checked={
                        filteredContacts.length > 0 &&
                        selectedContactIds.length === filteredContacts.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedContactIds(filteredContacts.map((c) => c.id))
                        else setSelectedContactIds([])
                      }}
                    />
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Assigned Groups</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No contacts found.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedContactIds.includes(c.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedContactIds([...selectedContactIds, c.id])
                            else setSelectedContactIds(selectedContactIds.filter((id) => id !== c.id))
                          }}
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 font-mono text-slate-700">{c.phone}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {c.groups.length === 0 ? (
                            <span className="text-[10px] text-slate-400">—</span>
                          ) : (
                            c.groups.map((g) => (
                              <Badge key={g.id} variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                {g.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-3 capitalize text-slate-500 text-[11px]">{c.source || 'manual'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
