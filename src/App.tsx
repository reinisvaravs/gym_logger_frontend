import { useEffect, useState } from 'react'
import { getCurrentUser } from './api/auth'
import LoginForm from './components/LoginForm'

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')

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
      <div className="mx-auto max-w-md">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gym Logger</h1>
          <p className="mt-2 text-slate-600">Track your strength training and cardio sessions.</p>
        </header>

        {isCheckingSession ? (
          <p role="status" className="text-slate-600">Checking your session…</p>
        ) : userId ? (
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">You’re logged in</h2>
          </section>
        ) : (
          <>
            {sessionError && <p role="alert" className="mb-4 text-sm text-red-700">{sessionError}</p>}
            <LoginForm onLogin={setUserId} />
          </>
        )}
      </div>
    </main>
  )
}

export default App
