import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Building2, Plus, Users, Calendar, LogOut } from 'lucide-react'

interface Organization {
  id: string
  name: string
  type: string
  description: string
  created_at: string
  member_count?: number
}

export default function OrganizationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_members(count)
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data.map((org: any) => ({
        ...org,
        member_count: org.organization_members[0]?.count || 0
      })) as Organization[]
    },
    enabled: !!user
  })

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
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <span className="text-lg">✨</span>
            </div>
            <Link to="/" className="text-xl font-bold text-white hover:text-purple-300 transition-colors truncate">
              Admin Dashboard
            </Link>
          </div>
          {/* Right side */}
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* Page title + Create button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">Organizations</h2>
            <p className="text-purple-300">Manage all your organizations</p>
          </div>
          <Link
            to="/organizations/create"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <Plus size={18} />
            Create New
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-20 text-purple-300">
            Loading organizations...
          </div>
        )}

        {!isLoading && organizations?.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-purple-900"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-4xl mb-4">🏢</p>
            <p className="text-white text-xl font-semibold mb-2">No organizations yet</p>
            <p className="text-purple-300 mb-6">Create your first organization to get started</p>
            <Link
              to="/organizations/create"
              className="px-6 py-3 rounded-xl font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              Create Organization
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {organizations?.map((org) => (
            <div
              key={org.id}
              onClick={() => navigate(`/organizations/${org.id}`)}
              className="rounded-2xl p-4 sm:p-6 border border-purple-900 cursor-pointer transition-all hover:border-purple-500"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              {/* Top row: name + badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Building2 size={18} className="text-purple-400 shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-white">{org.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(org.type)}`}>
                  {org.type}
                </span>
              </div>
              {/* Description */}
              {org.description && (
                <p className="text-purple-300 text-sm mb-3">{org.description}</p>
              )}
              {/* Bottom row: members + date */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-purple-400">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{org.member_count} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{new Date(org.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}