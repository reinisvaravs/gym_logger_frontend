import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser } from './api/auth'
import LoginForm from './components/LoginForm'
import TrainingHistory from './components/TrainingHistory'
import RegisterForm from './components/RegisterForm'
import AppNavigation from './components/AppNavigation'
import TrainingCalendar from './components/TrainingCalendar'
import TrainingLibrary from './components/TrainingLibrary'
import AccountSettings from './components/AccountSettings'
import AppIcon from './components/AppIcon'
import BrandLogo from './components/BrandLogo'
import { formatDisplayDate } from './formatDate'
import { NewSessionPage, SessionDetailPage } from './components/SessionPages'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const sectionName = location.pathname.startsWith('/calendar') ? 'Calendar' : location.pathname.startsWith('/training-types') ? 'Training library' : location.pathname.startsWith('/settings') ? 'Account settings' : 'Training history'
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const [userId, setUserId] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [isSessionNoticeSuccess, setIsSessionNoticeSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState('')

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((id) => { if (active) setUserId(id) })
      .catch(() => {
        if (active) setSessionError('Could not check your session. You can try logging in below.')
      })
      .finally(() => { if (active) setIsCheckingSession(false) })
    return () => { active = false }
  }, [])

  const handleSignedOut = useCallback((message?: string, success = false) => {
    setUserId(null)
    setSessionError(message || '')
    setIsSessionNoticeSuccess(success)
    setRegistrationMessage('')
    setRegisteredEmail('')
    navigate('/login', { replace: true })
  }, [navigate])

  function handleLogin(id: string) {
    setUserId(id)
    setSessionError('')
    setRegistrationMessage('')
    navigate('/history', { replace: true })
  }

  if (isCheckingSession) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-6"><BrandLogo to="/login" /><p role="status" className="loading-state">Opening your workspace…</p></div>
  }

  return userId ? (
    <div className="app-shell">
      <AppNavigation onSignedOut={handleSignedOut} />
      <div className="app-main">
        <header className="app-topbar">
          <div className="workspace-path"><span>Workspace</span><AppIcon name="chevron" className="h-3 w-3" /><strong>{sectionName}</strong></div>
          <div className="topbar-actions">
            <time dateTime={today} className="topbar-date">{formatDisplayDate(today)}</time>
            {!location.pathname.endsWith('/new') && <Link to="/history/sessions/new" className="btn btn-primary"><AppIcon name="plus" className="h-4 w-4" />Log session</Link>}
          </div>
        </header>
        <main id="main-content" className="page-content">
            <Routes>
              <Route path="/history" element={<TrainingHistory onSignedOut={handleSignedOut} />} />
              <Route path="/calendar" element={<TrainingCalendar onSignedOut={handleSignedOut} />} />
              <Route path="/training-types" element={<TrainingLibrary hideBack onBack={() => navigate('/history')} onSignedOut={handleSignedOut} />} />
              <Route path="/settings" element={<AccountSettings hideBack onBack={() => navigate('/history')} onSignedOut={handleSignedOut} />} />
              {['history', 'calendar'].map((section) => (
                <Route key={section}>
                  <Route path={`/${section}/sessions/new`} element={<NewSessionPage onSignedOut={handleSignedOut} />} />
                  <Route path={`/${section}/sessions/:sessionId`} element={<SessionDetailPage onSignedOut={handleSignedOut} />} />
                </Route>
              ))}
              <Route path="*" element={<Navigate to="/history" replace />} />
            </Routes>
        </main>
      </div>
    </div>
  ) : (
    <div className="auth-shell">
      <aside className="auth-story" aria-label="About Gym Logger">
        <BrandLogo to="/login" />
        <div className="auth-art" aria-hidden="true" />
        <div className="auth-story-copy">
          <p className="eyebrow">BUILT FOR YOUR NEXT SESSION</p>
          <h2>Put the work in.<br /><span>Keep the record.</span></h2>
          <p>A dedicated space for your strength training and cardio. Less guesswork. A clearer view of every session.</p>
          <div className="auth-tags"><span>Strength</span><span>Cardio</span><span>Your history</span></div>
        </div>
        <p className="auth-story-footer">ONE SESSION AT A TIME.</p>
      </aside>
      <main className="auth-main" id="main-content">
        <div className="auth-content">
          <div className="auth-mobile-brand"><BrandLogo to="/login" /></div>
          {sessionError && <p role={isSessionNoticeSuccess ? 'status' : 'alert'} className={`notice mb-5 ${isSessionNoticeSuccess ? 'notice-success' : 'notice-error'}`}>{sessionError}</p>}
            <Routes>
              <Route path="/register" element={<RegisterForm
                onLogin={() => navigate('/login')}
                onRegistered={(email) => {
                  setRegisteredEmail(email)
                  setRegistrationMessage('Account created. Log in to continue.')
                  setSessionError('')
                  navigate('/login', { replace: true })
                }}
              />} />
              <Route path="/login" element={<>
                {registrationMessage && <p role="status" className="mb-4 text-sm text-emerald-800 dark:text-emerald-300">{registrationMessage}</p>}
                <LoginForm initialEmail={registeredEmail} onLogin={handleLogin} onRegister={() => { setRegistrationMessage(''); navigate('/register') }} />
              </>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          <p className="auth-footnote">A personal training log. Built around you.</p>
        </div>
      </main>
    </div>
  )
}

export default App
