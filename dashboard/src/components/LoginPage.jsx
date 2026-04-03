import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { email, password, name }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')
      onLogin(data.user, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Seller Platform</h1>
          <p className="text-text-muted text-sm mt-2">AI-powered Amazon operations</p>
        </div>

        {/* Toggle */}
        <div className="flex gap-6 justify-center mb-8">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'login' ? 'text-text-primary border-brand' : 'text-text-muted border-transparent hover:text-text-secondary'}`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'register' ? 'text-text-primary border-brand' : 'text-text-muted border-transparent hover:text-text-secondary'}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-surface-raised text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          )}

          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl bg-surface-raised text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-surface-raised text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-status-bad text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-sm font-semibold"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
