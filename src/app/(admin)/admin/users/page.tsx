'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Sparkles,
  RefreshCw,
  Crown,
  Phone,
  Mail,
  Calendar,
  Filter,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { toast } from '@/hooks/use-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [tierFilter, setTierFilter] = useState('ALL')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.ok) {
        setUsers(data.users || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search) ||
        u.username?.toLowerCase().includes(search.toLowerCase())

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchesTier = tierFilter === 'ALL' || u.planTier === tierFilter

      return matchesSearch && matchesRole && matchesTier
    })
  }, [users, search, roleFilter, tierFilter])

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      })
      const data = await res.json()
      if (data.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
        toast({ title: 'Role Updated', description: `User role changed to ${newRole}` })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update role', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' })
    }
  }

  const handleUpdatePlanTier = async (id: string, newTier: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, planTier: newTier }),
      })
      const data = await res.json()
      if (data.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, planTier: newTier } : u)))
        toast({ title: 'Plan Updated', description: `User plan upgraded to ${newTier}` })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update tier', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' })
    }
  }

  const handleToggleBan = async (id: string, currentBanned: boolean) => {
    const actionName = currentBanned ? 'Unban' : 'Ban'
    if (!confirm(`Are you sure you want to ${actionName} this user?`)) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isBanned: !currentBanned }),
      })
      const data = await res.json()
      if (data.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isBanned: !currentBanned } : u)))
        toast({
          title: !currentBanned ? 'User Banned' : 'User Restored',
          description: !currentBanned
            ? 'Account has been restricted from posting'
            : 'Account access has been reactivated',
        })
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update ban status', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle ban status', variant: 'destructive' })
    }
  }

  return (
    <div>
      <AdminHeader
        title="User Management"
        teluguTitle="యూజర్ & రోల్స్ నిర్వహణ"
        description="Manage citizen accounts, business agents, plan tiers (Free/Premium), and ban controls."
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        {/* Filters and Search Bar - Light Theme */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">USER (సాధారణ పౌరులు)</option>
              <option value="AGENT">AGENT (రియల్టర్ / ఏజెంట్)</option>
              <option value="ADMIN">ADMIN (అడ్మినిస్ట్రేటర్)</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none"
            >
              <option value="ALL">All Plans</option>
              <option value="FREE">Free Tier</option>
              <option value="PREMIUM">Premium Member</option>
            </select>

            <button
              onClick={fetchUsers}
              title="Refresh"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Users DataTable */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Plan Tier</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                      Loading user directory...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                            {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{user.name || user.username || 'Citizen'}</p>
                            <p className="text-[11px] text-slate-400">@{user.username || user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <div className="space-y-0.5">
                          {user.phone ? (
                            <div className="flex items-center gap-1 font-medium text-slate-900">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">No phone</span>
                          )}
                          {user.email && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="truncate max-w-[150px]">{user.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={user.planTier || 'FREE'}
                          onChange={(e) => handleUpdatePlanTier(user.id, e.target.value)}
                          className={`rounded-md px-2.5 py-1 text-xs font-bold border transition ${
                            user.planTier === 'PREMIUM'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="FREE">Free Tier</option>
                          <option value="PREMIUM">★ Premium</option>
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={user.role || 'USER'}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold border ${
                            user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                              : user.role === 'AGENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="USER">User (పౌరులు)</option>
                          <option value="AGENT">Agent (ఏజెంట్)</option>
                          <option value="ADMIN">Admin (అడ్మిన్)</option>
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            <ShieldAlert className="h-3 w-3" /> Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <UserCheck className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleToggleBan(user.id, Boolean(user.isBanned))}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                            user.isBanned
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                          }`}
                        >
                          {user.isBanned ? 'Unban User' : 'Ban Account'}
                        </button>
                      </td>
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
