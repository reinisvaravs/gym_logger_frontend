import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getTrainingSessions, type TrainingSession, type TrainingSessionFilters } from '../api/trainingSessions'
import HistoryFilters from './HistoryFilters'
import { formatDisplayDate } from '../formatDate'
import AppIcon from './AppIcon'

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
      <header className="page-heading history-heading">
        <div>
          <p className="eyebrow">YOUR TRAINING LOG</p>
          <h2 id="history-heading">Training history</h2>
          <p className="page-subtitle">Your work, recorded. Find a session or start the next one.</p>
        </div>
        {!isLoading && !error && <span className="history-total">{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}{hasFilters ? ' found' : ''}</span>}
      </header>

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
        <p role="status" className="loading-state">Loading training history…</p>
      ) : error ? (
        <div className="panel panel-danger">
          <p role="alert" className="notice notice-error">{error}</p>
          <button type="button" onClick={retry} className="text-link mt-3">
            Try again
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-symbol"><AppIcon name={hasFilters ? 'search' : 'training'} className="h-7 w-7" /></span>
          <h3>{hasFilters ? 'No matching sessions' : 'Your next session starts here'}</h3>
          <p>{hasFilters ? 'Try another exercise name or adjust your date range.' : 'Choose an exercise, add your sets, and build a record you can come back to.'}</p>
          {!hasFilters && <Link to="/history/sessions/new" className="btn btn-primary"><AppIcon name="plus" className="h-4 w-4" />Log your first session</Link>}
        </div>
      ) : (
        <div className="history-list">
          <div className="list-caption"><span>{hasFilters ? 'Matching sessions' : 'All sessions'}</span><span>Newest first</span></div>
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                <Link to={`/history/sessions/${session.id}${location.search}`} className="history-row">
                  <span className="exercise-symbol"><AppIcon name={session.category === 'cardio' ? 'activity' : 'training'} /></span>
                  <div className="min-w-0">
                    <span className="history-row-title break-words">{session.training_name}</span>
                    <span className="history-row-meta"><time dateTime={session.performed_on}>{formatDisplayDate(session.performed_on)}</time><span aria-hidden="true">·</span><span>{session.category === 'cardio' ? 'Cardio' : session.category === 'bodyweight_reps' ? 'Bodyweight' : 'Weighted strength'}</span></span>
                    {session.notes && <p className="history-row-note">{session.notes}</p>}
                  </div>
                  <span className={`badge ${session.category !== 'cardio' ? 'badge-strength' : ''}`}>{session.category === 'cardio' ? 'CARDIO' : 'STRENGTH'}</span>
                  <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default TrainingHistory
