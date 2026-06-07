import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: organizations } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', user?.id)
      if (error) throw error
      return data
    },
    enabled: !!user
  })

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Logged in as {user?.email}
            </p>
            <Link
              to="/organizations"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 inline-block"
            >
              View Organizations
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Organizations
            </h2>
            <p className="text-3xl font-bold text-blue-600">
              {organizations?.length || 0}
            </p>
            <p className="text-gray-500 text-sm mt-1">Total organizations</p>
            <Link
              to="/organizations/create"
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 inline-block"
            >
              + Create New
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}