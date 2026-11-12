import { useEffect, useState } from 'react'
import { getTrainingSessions, type TrainingSession } from '../api/trainingSessions'
import SessionDetails from './SessionDetails'
import CreateSessionForm from './CreateSessionForm'
import TrainingLibrary from './TrainingLibrary'

type TrainingCalendarProps = {
  onBack: () => void
  onSignedOut: () => void
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function TrainingCalendar({ onBack, onSignedOut }: TrainingCalendarProps) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const from = formatDate(month)
  const to = formatDate(new Date(year, monthIndex + 1, 0))
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const emptyDays = (month.getDay() + 6) % 7
  const today = formatDate(new Date())
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
    setSelectedDate('')
    setMonth(new Date(year, monthIndex + direction, 1))
  }

  if (showLibrary) {
    return <TrainingLibrary backLabel="Back to calendar" onSignedOut={onSignedOut} onBack={() => setShowLibrary(false)} />
  }

  if (showCreateSession) {
    return <CreateSessionForm
      initialDate={selectedDate}
      backLabel="Back to calendar"
      onSignedOut={onSignedOut}
      onBack={() => setShowCreateSession(false)}
      onManageTypes={() => { setShowCreateSession(false); setShowLibrary(true) }}
      onSaved={(id) => {
        setShowCreateSession(false)
        setSelectedSessionId(id)
        refresh()
      }}
    />
  }

  if (selectedSessionId) {
    return <SessionDetails
      key={selectedSessionId}
      sessionId={selectedSessionId}
      backLabel="Back to calendar"
      onSignedOut={onSignedOut}
      onBack={() => { setSelectedSessionId(null); refresh() }}
    />
  }

  return (
    <section aria-labelledby="calendar-heading">
      <button type="button" onClick={onBack} className="mb-6 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100">Back to history</button>
      <h2 id="calendar-heading" className="text-2xl font-semibold">Training calendar</h2>

      <div className="my-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100">Previous</button>
        <h3 aria-live="polite" className="text-center font-semibold">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100">Next</button>
      </div>

      {isLoading ? (
        <p role="status" className="text-slate-600">Loading calendar…</p>
      ) : error ? (
        <div>
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={refresh} className="mt-3 cursor-pointer text-emerald-700 underline">Try again</button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 sm:text-sm">
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
                    onClick={() => setSelectedDate(date)}
                    aria-pressed={date === selectedDate}
                    aria-current={date === today ? 'date' : undefined}
                    aria-label={`${date}, ${count} ${count === 1 ? 'session' : 'sessions'}`}
                    className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-lg border text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${date === selectedDate ? 'border-emerald-700 bg-emerald-700 text-white' : date === today ? 'border-emerald-600 bg-emerald-50 text-slate-900 hover:bg-emerald-100' : 'border-transparent text-slate-900 hover:bg-slate-100'}`}
                  >
                    <span>{day}</span>
                    {count > 0 && <span className={`mt-1 rounded-full px-1.5 text-xs ${date === selectedDate ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Numbers below dates show the number of sessions.</p>

          {selectedDate ? (
            <div className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">Sessions on {selectedDate}</h3>
                <button type="button" onClick={() => setShowCreateSession(true)} className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">Log session</button>
              </div>
              {selectedSessions.length === 0 ? (
                <p className="text-slate-600">No sessions on this date.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedSessions.map((session) => (
                    <li key={session.id}>
                      <button type="button" onClick={() => setSelectedSessionId(session.id)} className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-600 focus-visible:outline-emerald-700">
                        <span className="block break-words font-medium text-emerald-700">{session.training_name}</span>
                        <span className="mt-1 block text-sm text-slate-500">{session.category === 'cardio' ? 'Cardio' : 'Strength'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : <p className="mt-6 text-slate-600">Select a date to view or add sessions.</p>}
        </>
      )}
    </section>
  )
}

export default TrainingCalendar
