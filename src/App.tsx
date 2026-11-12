import { useEffect, useState } from 'react'
import { getCurrentUser } from './api/auth'
import LoginForm from './components/LoginForm'
import TrainingHistory from './components/TrainingHistory'
import RegisterForm from './components/RegisterForm'

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [isSessionNoticeSuccess, setIsSessionNoticeSuccess] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'register'>('login')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registrationMessage, setRegistrationMessage] = useState('')

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((id) => {
        if (active) setUserId(id)
      })
      .catch(() => {
        if (active) setSessionError('Could not check your session. You can try logging in below.')
      })
      .finally(() => {
        if (active) setIsCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className={userId ? 'mx-auto max-w-3xl' : 'mx-auto max-w-md'}>
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gym Logger</h1>
          <p className="mt-2 text-slate-600">Track your strength training and cardio sessions.</p>
        </header>

        {isCheckingSession ? (
          <p role="status" className="text-slate-600">Checking your session…</p>
        ) : userId ? (
          <TrainingHistory onSignedOut={(message, success = false) => {
            setUserId(null)
            setSessionError(message || '')
            setIsSessionNoticeSuccess(success)
            setAuthView('login')
            setRegistrationMessage('')
            setRegisteredEmail('')
          }} />
        ) : (
          <>
            {sessionError && <p role={isSessionNoticeSuccess ? 'status' : 'alert'} className={`mb-4 text-sm ${isSessionNoticeSuccess ? 'text-emerald-800' : 'text-red-700'}`}>{sessionError}</p>}
            {authView === 'register' ? (
              <RegisterForm
                onLogin={() => setAuthView('login')}
                onRegistered={(email) => {
                  setRegisteredEmail(email)
                  setRegistrationMessage('Account created. Log in to continue.')
                  setSessionError('')
                  setAuthView('login')
                }}
              />
            ) : (
              <>
                {registrationMessage && <p role="status" className="mb-4 text-sm text-emerald-800">{registrationMessage}</p>}
                <LoginForm
                  initialEmail={registeredEmail}
                  onLogin={setUserId}
                  onRegister={() => {
                    setRegistrationMessage('')
                    setAuthView('register')
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default App
