import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { getCurrentUser } from './api/auth'
import LoginForm from './components/LoginForm'
import TrainingHistory from './components/TrainingHistory'
import RegisterForm from './components/RegisterForm'
import AppNavigation from './components/AppNavigation'
import TrainingCalendar from './components/TrainingCalendar'
import TrainingLibrary from './components/TrainingLibrary'
import AccountSettings from './components/AccountSettings'
import { NewSessionPage, SessionDetailPage } from './components/SessionPages'

function App() {
  const navigate = useNavigate()
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
      <div className={userId ? 'mx-auto max-w-4xl' : 'mx-auto max-w-md'}>
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold"><Link to={userId ? '/history' : '/login'}>Gym Logger</Link></h1>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Track your strength training and cardio sessions.</p>
        </header>

        {isCheckingSession ? (
          <p role="status" className="text-slate-600 dark:text-slate-300">Checking your session…</p>
        ) : userId ? (
          <>
            <AppNavigation onSignedOut={handleSignedOut} />
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
          </>
        ) : (
          <>
            {sessionError && <p role={isSessionNoticeSuccess ? 'status' : 'alert'} className={`mb-4 text-sm ${isSessionNoticeSuccess ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-700 dark:text-red-400'}`}>{sessionError}</p>}
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
          </>
        )}
      </div>
    </main>
  )
}

export default App
