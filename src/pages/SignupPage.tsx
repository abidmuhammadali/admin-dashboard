import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  })

  async function onSubmit(data: SignupForm) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } }
    })
    if (error) {
      setError('root', { message: error.message })
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0533 50%, #0f0a1e 100%)' }}>

      <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-white mt-2">Set up your Admin Dashboard</p>
        </div>

        <div className="rounded-2xl p-8 border border-purple-900"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>

          {errors.root && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-sm">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                {...register('fullName')}
                type="text"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-purple-400 border border-purple-700 focus:outline-none focus:border-purple-400"
                style={{ background: 'rgba(255,255,255,0.07)' }}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-300 hover:text-white font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}