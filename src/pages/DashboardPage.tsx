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
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0533 50%, #0f0a1e 100%)' }}>

      {/* Background circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-purple-900"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <span className="text-sm">⚡</span>
            </div>
            <Link to="/" className="text-xl font-bold text-white hover:text-purple-300 transition-colors">
             Admin Dashoard</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-purple-300 text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm text-white border border-purple-700 hover:border-purple-400 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-purple-300">
            Manage your organizations from one place
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-2xl p-6 border border-purple-900"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-purple-300 text-sm mb-2">Total Organizations</p>
            <p className="text-4xl font-bold text-white">{organizations?.length || 0}</p>
          </div>
          <div className="rounded-2xl p-6 border border-purple-900"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-purple-300 text-sm mb-2">Account</p>
            <p className="text-white font-medium truncate">{user?.email}</p>
          </div>
          <div className="rounded-2xl p-6 border border-purple-900"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-purple-300 text-sm mb-2">Quick Actions</p>
            <Link
              to="/organizations/create"
              className="inline-block px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              + Create Organization
            </Link>
          </div>
        </div>

        <Link
          to="/organizations"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white border border-purple-700 hover:border-purple-400 transition-all"
        >
          View All Organizations →
        </Link>
      </main>
    </div>
  )
}