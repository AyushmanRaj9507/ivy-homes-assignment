import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = ['demo1@ivy.homes', 'demo2@ivy.homes', 'demo3@ivy.homes']

export default function Login() {
  const { login, isAuthenticated, authError, clearAuthError } = useAuth()
  const [email, setEmail] = useState('demo1@ivy.homes')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? '/listings'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    clearAuthError()
    setLoading(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname ?? '/listings', { replace: true })
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(detail || 'Could not sign in. Check the email and password and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ivy-950 mb-1">Sign in</h1>
      <p className="text-sm text-ivy-600 font-body mb-8">
        Use one of the demo accounts issued with your API key.
      </p>

      {(error || authError) && (
        <div className="border border-clay text-clay text-sm font-body px-3 py-2 mb-6">
          {error || authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-body text-ivy-600 mb-1">Email</label>
          <input
            list="demo-accounts"
            className="w-full border hairline bg-white/60 px-3 py-2.5 text-sm font-body outline-none focus:border-ivy-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <datalist id="demo-accounts">
            {DEMO_ACCOUNTS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-xs font-body text-ivy-600 mb-1">Password</label>
          <input
            type="password"
            className="w-full border hairline bg-white/60 px-3 py-2.5 text-sm font-body outline-none focus:border-ivy-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password issued with your API key"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ivy-900 text-paper py-2.5 text-sm font-body hover:bg-ivy-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-xs text-ivy-500 font-body mt-6">
        demo1, demo2 and demo3 share one password. Each keeps its own saved-listings list.
      </p>
    </div>
  )
}
