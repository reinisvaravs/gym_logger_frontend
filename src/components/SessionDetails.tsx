import { useEffect, useState } from 'react'
import { getTrainingSession, type TrainingSessionDetails } from '../api/trainingSessions'

type SessionDetailsProps = {
  sessionId: string
  onBack: () => void
  onSignedOut: () => void
}

function SessionDetails({ sessionId, onBack, onSignedOut }: SessionDetailsProps) {
  const [session, setSession] = useState<TrainingSessionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    getTrainingSession(sessionId)
      .then((data) => {
        if (!active) return
        if (data === null) {
          onSignedOut()
          return
        }
        setSession(data)
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : 'Could not load this training session.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [sessionId, onSignedOut, retryCount])

  function retry() {
    setError('')
    setIsLoading(true)
    setRetryCount(retryCount + 1)
  }

  return (
    <section aria-label="Session details">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        Back to history
      </button>

      {isLoading ? (
        <p role="status" className="text-slate-600">Loading session…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <p role="alert" className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={retry} className="mt-3 cursor-pointer font-medium text-emerald-700 underline">
            Try again
          </button>
        </div>
      ) : session && (
        <>
          <header className="mb-6">
            <h2 className="break-words text-2xl font-semibold">{session.training_name}</h2>
            <p className="mt-2 text-sm text-slate-600">
              <time dateTime={session.performed_on}>{session.performed_on}</time>
              {' · '}
              {session.category === 'cardio' ? 'Cardio' : session.category === 'bodyweight_reps' ? 'Bodyweight' : 'Weighted strength'}
            </p>
            {session.notes && <p className="mt-4 whitespace-pre-wrap break-words text-slate-600">{session.notes}</p>}
          </header>

          <h3 className="mb-3 text-lg font-semibold">Sets</h3>
          {session.sets.length === 0 && <p className="text-slate-600">No sets saved.</p>}
          <ol className="space-y-3">
            {session.sets.map((set) => (
              <li key={set.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 font-medium">Set {set.set_order}</h4>
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  {session.category === 'cardio' ? (
                    <>
                      {set.duration_seconds !== null && (
                        <div><dt className="text-slate-500">Duration</dt><dd className="mt-1 font-medium">{Math.floor(set.duration_seconds / 60)}:{String(set.duration_seconds % 60).padStart(2, '0')} min</dd></div>
                      )}
                      {set.distance_km !== null && (
                        <div><dt className="text-slate-500">Distance</dt><dd className="mt-1 font-medium">{Number(set.distance_km)} km</dd></div>
                      )}
                      {set.avg_heart_rate_bpm !== null && (
                        <div><dt className="text-slate-500">Avg. heart rate</dt><dd className="mt-1 font-medium">{set.avg_heart_rate_bpm} bpm</dd></div>
                      )}
                      {set.avg_power_watts !== null && (
                        <div><dt className="text-slate-500">Avg. power</dt><dd className="mt-1 font-medium">{Number(set.avg_power_watts)} W</dd></div>
                      )}
                      {set.avg_cadence !== null && (
                        <div><dt className="text-slate-500">Avg. cadence</dt><dd className="mt-1 font-medium">{Number(set.avg_cadence)}</dd></div>
                      )}
                      {set.elevation_gain_m !== null && (
                        <div><dt className="text-slate-500">Elevation gain</dt><dd className="mt-1 font-medium">{Number(set.elevation_gain_m)} m</dd></div>
                      )}
                    </>
                  ) : (
                    <>
                      {set.reps !== null && (
                        <div><dt className="text-slate-500">Reps</dt><dd className="mt-1 font-medium">{Number(set.reps)}</dd></div>
                      )}
                      {set.weight_kg !== null && (
                        <div><dt className="text-slate-500">{session.category === 'bodyweight_reps' ? 'Added weight' : 'Weight'}</dt><dd className="mt-1 font-medium">{Number(set.weight_kg)} kg</dd></div>
                      )}
                    </>
                  )}
                </dl>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}

export default SessionDetails
