import { useEffect, useState } from 'react'
import { logout } from '../api/auth'
import { getTrainingSessions, type TrainingSession } from '../api/trainingSessions'
import SessionDetails from './SessionDetails'

type TrainingHistoryProps = {
  onSignedOut: () => void
}

function TrainingHistory({ onSignedOut }: TrainingHistoryProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getTrainingSessions()
      .then((data) => {
        if (!active) return
        if (data === null) {
          onSignedOut()
          return
        }
        setSessions(data)
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : 'Could not load training history.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [onSignedOut, retryCount])

  function retry() {
    setError('')
    setIsLoading(true)
    setRetryCount(retryCount + 1)
  }

  async function handleLogout() {
    if (isLoggingOut) return
    setLogoutError('')
    setIsLoggingOut(true)

    try {
      await logout()
      onSignedOut()
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Could not log out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (selectedSessionId) {
    return (
      <SessionDetails
        key={selectedSessionId}
        sessionId={selectedSessionId}
        onBack={() => setSelectedSessionId(null)}
        onSignedOut={onSignedOut}
      />
    )
  }

  return (
    <section aria-labelledby="history-heading">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="history-heading" className="text-2xl font-semibold">Training history</h2>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </div>

      {logoutError && <p role="alert" className="mb-4 text-sm text-red-700">{logoutError}</p>}

      {isLoading ? (
        <p role="status" className="text-slate-600">Loading training history…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={retry} className="mt-3 cursor-pointer font-medium text-emerald-700 underline">
            Try again
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          No training sessions yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 break-words font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className="cursor-pointer text-left text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                    >
                      {session.training_name}
                    </button>
                  </h3>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {session.category === 'cardio' ? 'Cardio' : 'Strength'}
                  </span>
                </div>
                <time dateTime={session.performed_on} className="mt-1 block text-sm text-slate-500">
                  {session.performed_on}
                </time>
                {session.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-600">{session.notes}</p>}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TrainingHistory
