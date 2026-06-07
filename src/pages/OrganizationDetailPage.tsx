import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

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

  function getTypeBadgeColor(type: string) {
    switch (type) {
      case 'School': return 'bg-blue-100 text-blue-800'
      case 'Nonprofit': return 'bg-green-100 text-green-800'
      case 'Business': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/organizations" className="text-blue-600 hover:underline text-sm">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {org?.name}
            </h1>
            {org?.type && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(org.type)}`}>
                {org.type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Organization Details
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Type:</span> {org?.type}</p>
              <p><span className="font-medium">Description:</span> {org?.description || 'No description'}</p>
              {org?.school_district && (
                <p><span className="font-medium">School District:</span> {org.school_district}</p>
              )}
              <p><span className="font-medium">Created:</span> {org?.created_at ? new Date(org.created_at).toLocaleDateString() : ''}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Members ({members?.length || 0})
            </h2>

            {members?.length === 0 && (
              <p className="text-gray-500 text-sm">No members yet. Invite someone!</p>
            )}

            <div className="space-y-3">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-gray-900">{member.email}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status}
                    </span>
                    <span className="text-xs text-gray-400">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invite Member
          </h2>

          {inviteError && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
              {inviteError}
            </div>
          )}

          {inviteSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
              {inviteSuccess}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="member@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {inviteLoading ? 'Inviting...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}