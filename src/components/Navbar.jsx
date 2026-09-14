import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/listings', label: 'Sale' },
  { to: '/rentals', label: 'Rent' },
  { to: '/projects', label: 'Projects' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/favourites', label: 'Saved' }
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b hairline bg-paper sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/listings" className="flex items-baseline gap-2">
            <span className="font-display text-2xl text-ivy-900">Ivy</span>
            <span className="font-body text-xs tracking-wide text-ivy-600">Homes</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-body border-b-2 transition-colors ${
                    isActive
                      ? 'border-brass-500 text-ivy-950'
                      : 'border-transparent text-ivy-700 hover:text-ivy-950'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-ivy-700 font-body">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-body px-3 py-1.5 border hairline text-ivy-900 hover:bg-ivy-100 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="text-sm font-body px-3 py-1.5 bg-ivy-900 text-paper hover:bg-ivy-800 transition-colors"
              >
                Sign in
              </NavLink>
            )}
          </div>
        </div>

        <nav className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm font-body whitespace-nowrap border-b-2 ${
                  isActive ? 'border-brass-500 text-ivy-950' : 'border-transparent text-ivy-700'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
