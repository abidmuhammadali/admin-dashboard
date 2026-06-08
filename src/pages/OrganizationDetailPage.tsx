import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { LogOut } from 'lucide-react'

interface Member {
  id: string
  email: string
  status: string
  role: string
  invited_at: string
}

interface Organization {
  id: string
  name: string
  type: string
  description: string
  school_district: string
  created_at: string
}

export default function OrganizationDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const { data: org } = useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Organization
    }
  })

  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', id)
        .order('invited_at', { ascending: false })
      if (error) throw error
      return data as Member[]
    }
  })

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError('')
    setInviteSuccess('')
    const { error } = await supabase
      .from('organization_members')
      .insert({
        organization_id: id,
        email: inviteEmail,
        status: 'invited',
        role: 'member'
      })
    if (error) {
      if (error.code === '23505') {
        setInviteError('This email has already been invited!')
      } else {
        setInviteError(error.message)
      }
    } else {
      setInviteSuccess(`${inviteEmail} has been invited!`)
      setInviteEmail('')
      refetchMembers()
    }
    setInviteLoading(false)
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case 'School': return 'bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30'
      case 'Nonprofit': return 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-30'
      case 'Business': return 'bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500 border-opacity-30'
      default: return 'bg-gray-500 bg-opacity-20 text-gray-300'
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0533 50%, #0f0a1e 100%)' }}>

      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-purple-900"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          {/* Left: back + org name + badge */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/organizations"
              className="text-purple-300 hover:text-white text-sm transition-colors shrink-0">
              ← Back
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white truncate">
                {org?.name}
              </h1>
              {org?.type && (
                <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(org.type)}`}>
                  {org.type}
                </span>
              )}
            </div>
          </div>
          {/* Right: email + sign out */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:block text-purple-300 text-sm truncate max-w-[180px]">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white border border-purple-700 hover:border-purple-400 hover:bg-purple-900/30 transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="lg:col-span-2 space-y-6">
          {/* Org Details */}
          <div className="rounded-2xl p-5 sm:p-6 border border-purple-900"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h2 className="text-lg font-semibold text-white mb-4">Organization Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-purple-400 w-32 shrink-0">Type</span>
                <span className="text-white">{org?.type}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 w-32 shrink-0">Description</span>
                <span className="text-white">{org?.description || 'No description'}</span>
              </div>
              {org?.school_district && (
                <div className="flex gap-2">
                  <span className="text-purple-400 w-32 shrink-0">School District</span>
                  <span className="text-white">{org.school_district}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-purple-400 w-32 shrink-0">Created</span>
                <span className="text-white">
                  {org?.created_at ? new Date(org.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="rounded-2xl p-5 sm:p-6 border border-purple-900"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <h2 className="text-lg font-semibold text-white mb-4">
              Members ({members?.length || 0})
            </h2>

            {members?.length === 0 && (
              <p className="text-purple-400 text-sm">No members yet. Invite someone!</p>
            )}

            <div className="space-y-3">
              {members?.map((member) => (
                <div key={member.id}
                  className="flex flex-wrap items-center gap-2 py-3 border-b border-purple-900 last:border-0">
                  {/* Email takes available space, wraps if needed */}
                  <span className="text-white text-sm break-all flex-1 min-w-0">
                    {member.email}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-500 bg-opacity-20 text-green-300'
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                    }`}>
                      {member.status}
                    </span>
                    <span className="text-purple-400 text-xs">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invite Form */}
        <div className="rounded-2xl p-5 sm:p-6 border border-purple-900 h-fit"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Invite Member</h2>

          {inviteError && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
              {inviteError}
            </div>
          )}
          {inviteSuccess && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-3 rounded-lg mb-4 text-sm">
              {inviteSuccess}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400 text-sm"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                placeholder="member@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading}
              className="w-full py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              {inviteLoading ? 'Inviting...' : 'Send Invitation →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}