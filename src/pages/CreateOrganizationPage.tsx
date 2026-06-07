import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function CreateOrganizationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    school_district: ''
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase
      .from('organizations')
      .insert({
        name: form.name,
        type: form.type,
        description: form.description,
        school_district: form.type === 'School' ? form.school_district : null,
        created_by: user?.id
      })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/organizations')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0533 50%, #0f0a1e 100%)' }}>

      <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-purple-900"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/organizations"
              className="text-purple-300 hover:text-white text-sm transition-colors">
              ← Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                <span className="text-sm">⚡</span>
              </div>
              <h1 className="text-xl font-bold text-white">Create Organization</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">New Organization</h2>
          <p className="text-purple-300">Fill in the details below to create your organization</p>
        </div>

        <div className="rounded-2xl p-8 border border-purple-900"
          style={{ background: 'rgba(255,255,255,0.05)' }}>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                placeholder="Enter organization name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Organization Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 text-white border border-purple-700 focus:outline-none focus:border-purple-400"
                style={{ background: '#1a0533' }}
                required
              >
                <option value="">Select a type</option>
                <option value="School">🏫 School</option>
                <option value="Nonprofit">💚 Nonprofit</option>
                <option value="Business">💼 Business</option>
              </select>
            </div>

            {form.type === 'School' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  School District
                </label>
                <input
                  type="text"
                  name="school_district"
                  value={form.school_district}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  placeholder="Enter school district"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                placeholder="Brief description of your organization"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              {loading ? 'Creating...' : 'Create Organization →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}