'use client'

import { useState } from 'react'
import { Camera, Loader2, Save, Crown, Shield, Eye, EyeOff, Check, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'
import { cn } from '@/lib/utils'
import type { Village } from '@prisma/client'

interface ProfileUser {
  id: string
  name: string | null
  username: string | null
  email: string
  phone: string | null
  bio: string | null
  image: string | null
  coverImage: string | null
  isPublic: boolean
  role: string
  planTier: string
  planExpiresAt: string | null
  villageId: string | null
}

export function ProfileSection({
  user,
  villages,
}: {
  user: ProfileUser
  villages: Pick<Village, 'id' | 'name' | 'slug'>[]
}) {
  const [name, setName] = useState(user.name ?? '')
  const [username, setUsername] = useState(user.username ?? '')
  const [bio, setBio] = useState(user.bio ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')
  const [image, setImage] = useState<string | null>(user.image)
  const [coverImage, setCoverImage] = useState<string | null>(user.coverImage)
  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [saving, setSaving] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [pwEmail, setPwEmail] = useState(user.email)
  const [pwBusy, setPwBusy] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: username.trim() || undefined,
          bio: bio.trim() || undefined,
          phone: phone.trim() || undefined,
          image,
          coverImage,
          isPublic,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save')
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordReset() {
    setPwBusy(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: pwEmail }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success('Password reset link sent to your email')
      setPwOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send reset link')
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Profile</h2>
          <p className="text-sm text-slate-500">Manage your public presence & account.</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          {user.planTier} Plan
        </Badge>
      </div>

      {/* Cover + Avatar */}
      <div className="overflow-hidden rounded-3xl glass">
        <div className="relative">
          <div className="relative h-40 w-full sm:h-48">
            {coverImage ? (
               
              <img loading="lazy" decoding="async" src={coverImage} alt="cover" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full gradient-brand" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-12 flex items-end gap-4">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                  {image ? (
                     
                    <img loading="lazy" decoding="async" src={image} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand text-3xl font-black text-white">
                      {(name || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 pb-1">
                <h3 className="text-lg font-bold text-slate-900">{name || 'Your name'}</h3>
                <p className="text-sm text-slate-500">@{username || 'username'} · {user.email}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ImageUpload
                value={image}
                onChange={setImage}
                folder="avatars"
                aspect="square"
                label="Profile Photo (1:1)"
              />
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                folder="covers"
                aspect="video"
                label="Cover Banner (16:9)"
                className="col-span-1 sm:col-span-3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
          Account Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Username">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                @
              </span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="pl-7"
              />
            </div>
          </Field>
          <Field label="Phone Number">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
          </Field>
          <Field label="Email (read-only)">
            <Input value={user.email} disabled className="bg-slate-50 text-slate-400" />
          </Field>
        </div>
        <Field label="Bio" className="mt-4">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people about yourself…"
            rows={3}
            maxLength={280}
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">{bio.length}/280</p>
        </Field>
      </div>

      {/* Privacy + Upgrade */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl glass p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
              {isPublic ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Profile Visibility</h3>
              <p className="text-xs text-slate-500">
                {isPublic
                  ? 'Your profile is visible in Community.'
                  : 'Your profile is private (hidden from Community).'}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="h-3.5 w-3.5" />
            Only public profiles appear in community posts.
          </div>
        </div>

        <div className="rounded-3xl glass p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <Crown className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Plan & Upgrades</h3>
              <p className="text-xs text-slate-500">
                Current: <span className="font-semibold">{user.planTier}</span> · Early Bird All FREE.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50">
              <Crown className="h-3.5 w-3.5" /> Upgrade to Premium
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50">
              Become Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Security / Password Reset */}
      <div className="rounded-3xl glass p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
            <KeyRound className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Password & Security</h3>
            <p className="text-xs text-slate-500">
              Send a password reset link to your email to change your password.
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPwOpen(true)}>
            <KeyRound className="h-3.5 w-3.5" /> Reset Password
          </Button>
        </div>
      </div>

      {/* Password reset dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
              <KeyRound className="h-4 w-4 text-blue-600" /> Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              A password reset link will be sent to your email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Field label="Email or Phone">
              <Input value={pwEmail} onChange={(e) => setPwEmail(e.target.value)} placeholder="your@email.com" />
            </Field>
            <Button onClick={handlePasswordReset} disabled={pwBusy} className="w-full gap-2 gradient-brand text-white">
              {pwBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Send Reset Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save bar */}
      <div className="sticky bottom-20 z-30 flex justify-end lg:bottom-4">
        <Button onClick={save} disabled={saving} className="gap-2 gradient-brand text-white shadow-lg shadow-blue-500/30">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</Label>
      {children}
    </div>
  )
}
