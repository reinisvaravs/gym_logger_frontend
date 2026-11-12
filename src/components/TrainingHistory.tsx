import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getTrainingSessions, type TrainingSession, type TrainingSessionFilters } from '../api/trainingSessions'
import HistoryFilters from './HistoryFilters'
import { formatDisplayDate } from '../formatDate'

type TrainingHistoryProps = {
  onSignedOut: (message?: string, success?: boolean) => void
}

function TrainingHistory({ onSignedOut }: TrainingHistoryProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const search = params.get('search') || ''
  const categoryParam = params.get('category')
  const category = categoryParam === 'strength' || categoryParam === 'cardio' ? categoryParam : ''
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const filters: TrainingSessionFilters = { search, category, from, to }
  const hasFilters = Boolean(search || category || from || to)

  useEffect(() => {
    let active = true

    getTrainingSessions(from, to, search, category)
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
  }, [onSignedOut, retryCount, from, to, search, category])

  function retry() {
    setError('')
    setIsLoading(true)
    setRetryCount(retryCount + 1)
  }

  return (
    <section aria-labelledby="history-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-heading" className="text-2xl font-semibold">Training history</h2>
        <Link to={`/history/sessions/new${location.search}`} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">Log session</Link>
      </div>

      <HistoryFilters
        key={params.toString()}
        initialFilters={filters}
        isLoading={isLoading}
        onApply={(updated) => {
          const next = new URLSearchParams()
          if (updated.search) next.set('search', updated.search)
          if (updated.category) next.set('category', updated.category)
          if (updated.from) next.set('from', updated.from)
          if (updated.to) next.set('to', updated.to)
          setParams(next)
          retry()
        }}
      />

      {isLoading ? (
        <p role="status" className="text-slate-600 dark:text-slate-300">Loading training history…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-6">
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button type="button" onClick={retry} className="mt-3 cursor-pointer font-medium text-emerald-700 dark:text-emerald-400 underline">
            Try again
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-300">
          {hasFilters ? 'No sessions match these filters.' : 'No training sessions yet.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="min-w-0 break-words font-semibold">
                    <Link
                      to={`/history/sessions/${session.id}${location.search}`}
                      className="cursor-pointer text-left text-emerald-700 dark:text-emerald-400 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:focus-visible:outline-emerald-400"
                    >
                      {session.training_name}
                    </Link>
                  </h3>
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
                    {session.category === 'cardio' ? 'Cardio' : 'Strength'}
                  </span>
                </div>
                <time dateTime={session.performed_on} className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                  {formatDisplayDate(session.performed_on)}
                </time>
                {session.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">{session.notes}</p>}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TrainingHistory
