import { useEffect, useState } from 'react'
import { getTrainingSessions, type TrainingSession } from '../api/trainingSessions'
import { Link, useSearchParams } from 'react-router-dom'
import { formatDisplayDate } from '../formatDate'

type TrainingCalendarProps = {
  onSignedOut: () => void
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function TrainingCalendar({ onSignedOut }: TrainingCalendarProps) {
  const [params, setParams] = useSearchParams()
  const today = formatDate(new Date())
  const requestedMonth = params.get('month') || today.slice(0, 7)
  const monthText = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : today.slice(0, 7)
  const month = new Date(`${monthText}-01T00:00:00`)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const from = formatDate(month)
  const to = formatDate(new Date(year, monthIndex + 1, 0))
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const emptyDays = (month.getDay() + 6) % 7
  const requestedDate = params.get('date') || (monthText === today.slice(0, 7) ? today : '')
  const selectedDate = requestedDate >= from && requestedDate <= to ? requestedDate : ''
  const dayParams = new URLSearchParams({ month: monthText, date: selectedDate })
  const selectedSessions = sessions.filter((session) => session.performed_on === selectedDate)

  useEffect(() => {
    let active = true
    getTrainingSessions(from, to)
      .then((data) => {
        if (!active) return
        if (data === null) return onSignedOut()
        setSessions(data)
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : 'Could not load the calendar.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [from, to, onSignedOut, retryCount])

  function refresh() {
    setError('')
    setIsLoading(true)
    setRetryCount(retryCount + 1)
  }

  function changeMonth(direction: number) {
    setError('')
    setIsLoading(true)
    setParams({ month: formatDate(new Date(year, monthIndex + direction, 1)).slice(0, 7) })
  }

  return (
    <section aria-labelledby="calendar-heading">
      <header className="page-heading"><p className="eyebrow">SHOW UP. KEEP GOING.</p><h2 id="calendar-heading">Training calendar</h2><p className="page-subtitle">A month of movement. Select a day to see or log your training.</p></header>

      <div className="my-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="btn btn-secondary">Previous</button>
        <h3 aria-live="polite" className="text-center font-semibold">{month.toLocaleDateString('en-GB', { month: 'short', year: year === new Date().getFullYear() ? undefined : 'numeric' })}</h3>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="btn btn-secondary">Next</button>
      </div>

      {isLoading ? (
        <p role="status" className="loading-state">Loading calendar…</p>
      ) : error ? (
        <div>
          <p role="alert" className="notice notice-error">{error}</p>
          <button type="button" onClick={refresh} className="text-link mt-3">Try again</button>
        </div>
      ) : (
        <>
          <div className="panel">
            <div className="calendar-weekdays">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: emptyDays }, (_, index) => <div key={`empty-${index}`} />)}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1
                const date = formatDate(new Date(year, monthIndex, day))
                const count = sessions.filter((session) => session.performed_on === date).length
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setParams({ month: monthText, date })}
                    aria-pressed={date === selectedDate}
                    aria-current={date === today ? 'date' : undefined}
                    aria-label={`${formatDisplayDate(date)}, ${count} ${count === 1 ? 'session' : 'sessions'}`}
                    className={`calendar-cell flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-lg border text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:focus-visible:outline-emerald-400 ${date === selectedDate ? 'border-emerald-700 bg-emerald-700 text-white' : date === today ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-slate-900 dark:text-slate-100 hover:bg-emerald-100 dark:hover:bg-emerald-900' : 'border-transparent text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span>{day}</span>
                    {count > 0 && <span className={`mt-1 rounded-full px-1.5 text-xs ${date === selectedDate ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'}`}>{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Numbers below dates show the number of sessions.</p>

          {selectedDate ? (
            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">Sessions on {formatDisplayDate(selectedDate)}</h3>
                <Link to={`/calendar/sessions/new?${dayParams}`} className="btn btn-primary">Log session</Link>
              </div>
              {selectedSessions.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-300">No sessions on this date.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedSessions.map((session) => (
                    <li key={session.id}>
                      <Link to={`/calendar/sessions/${session.id}?${dayParams}`} className="block w-full cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-left hover:border-emerald-600 focus-visible:outline-emerald-700 dark:focus-visible:outline-emerald-400">
                        <span className="block break-words font-medium text-emerald-700 dark:text-emerald-400">{session.training_name}</span>
                        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{session.category === 'cardio' ? 'Cardio' : 'Strength'}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : <p className="mt-6 text-slate-600 dark:text-slate-300">Select a date to view or add sessions.</p>}
        </>
      )}
    </section>
  )
}

export default TrainingCalendar
