import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { logout } from '../api/auth'
import AppIcon from './AppIcon'
import BrandLogo from './BrandLogo'

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

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand"><BrandLogo /></div>
      <p className="sidebar-label">YOUR WORKSPACE</p>
      <nav aria-label="Main navigation" className="sidebar-links">
        <NavLink to="/history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><AppIcon name="history" /><span>History</span></NavLink>
        <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><AppIcon name="calendar" /><span>Calendar</span></NavLink>
        <NavLink to="/progress" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><AppIcon name="activity" /><span>Progress</span></NavLink>
        <NavLink to="/training-types" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><AppIcon name="library" /><span>Library</span></NavLink>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><AppIcon name="settings" /><span>Settings</span></NavLink>
      </nav>
      <div className="sidebar-bottom">
        <p className="sidebar-note">YOUR TRAINING. YOUR SPACE.</p>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="sidebar-logout"><AppIcon name="logout" className="h-4 w-4" /><span>{isLoggingOut ? 'Logging out…' : 'Log out'}</span></button>
        {error && <p role="alert" className="notice notice-error mt-3">{error}</p>}
      </div>
    </aside>
  )
}

export default AppNavigation
