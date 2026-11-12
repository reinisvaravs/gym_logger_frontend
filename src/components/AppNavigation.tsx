import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { logout } from '../api/auth'

type AppNavigationProps = {
  onSignedOut: () => void
}

function AppNavigation({ onSignedOut }: AppNavigationProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    if (isLoggingOut) return
    setError('')
    setIsLoggingOut(true)
    try {
      await logout()
      onSignedOut()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not log out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const links = [
    { to: '/history', label: 'History' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/training-types', label: 'Training library' },
    { to: '/settings', label: 'Settings' },
  ]

  return (
    <div className="mb-8 border-b border-slate-200 pb-4 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Main navigation" className="flex flex-wrap gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${isActive ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300' : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 disabled:opacity-60">{isLoggingOut ? 'Logging out…' : 'Log out'}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default AppNavigation
