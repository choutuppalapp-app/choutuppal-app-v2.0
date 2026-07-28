'use client'

import { useState } from 'react'
import { UserPlus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface CreateUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateUserModal({ open, onOpenChange, onCreated }: CreateUserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('AGENT')
  const [username, setUsername] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Name, email, and password are required')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          role,
          username: username.trim() || undefined,
          isPublic,
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success(`${role === 'AGENT' ? 'Agent' : role === 'ADMIN' ? 'Admin' : 'User'} account created for ${name}`)
      reset()
      onOpenChange(false)
      onCreated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create user')
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setName(''); setEmail(''); setPhone(''); setPassword('')
    setRole('AGENT'); setUsername(''); setIsPublic(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
            <UserPlus className="h-4 w-4 text-blue-600" /> Create New User
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create a new account directly. The user can log in immediately with the password you set.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-6 pt-2">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Full Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs font-semibold text-slate-600">Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div>
              <Label className="mb-1 block text-xs font-semibold text-slate-600">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs font-semibold text-slate-600">Password *</Label>
              <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min 6 chars" />
            </div>
            <div>
              <Label className="mb-1 block text-xs font-semibold text-slate-600">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="AGENT">AGENT</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Username (optional)</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            <span className="text-xs text-slate-600">Public profile (visible in Community)</span>
          </div>

          <Button onClick={submit} disabled={busy} className="w-full gap-2 gradient-brand text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Create {role === 'AGENT' ? 'Agent' : role === 'ADMIN' ? 'Admin' : 'User'} Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
