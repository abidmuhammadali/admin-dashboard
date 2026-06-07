import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

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

  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Organization[]
    },
    enabled: !!user
  })

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
          <h1 className="text-xl font-bold text-gray-900">Organizations</h1>
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Organizations
          </h2>
          <Link
            to="/organizations/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            + Create Organization
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">
            Loading organizations...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Error loading organizations
          </div>
        )}

        {!isLoading && organizations?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No organizations yet</p>
            <Link
              to="/organizations/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Create your first organization
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {organizations?.map((org) => (
            <div
              key={org.id}
              onClick={() => navigate(`/organizations/${org.id}`)}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {org.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {org.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(org.type)}`}>
                    {org.type}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(org.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}