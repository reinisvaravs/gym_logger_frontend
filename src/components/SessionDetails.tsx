import { useEffect, useState } from 'react'
import { getTrainingSession, deleteTrainingSet, deleteTrainingSession, type TrainingSessionDetails, type TrainingSet } from '../api/trainingSessions'
import EditSessionForm from './EditSessionForm'
import EditSetForm from './EditSetForm'
import AddSetForm from './AddSetForm'
import { useUnits } from '../UnitsContext'
import { displayWeight, displayDistance, displayElevation } from '../units'

type SessionDetailsProps = {
  backLabel?: string
  sessionId: string
  onBack: () => void
  onSignedOut: () => void
}

function SessionDetails({ sessionId, onBack, onSignedOut, backLabel = 'Back to history' }: SessionDetailsProps) {
  const { unitSystem } = useUnits()
  const [session, setSession] = useState<TrainingSessionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [editingSet, setEditingSet] = useState<TrainingSet | null>(null)
  const [isAddingSet, setIsAddingSet] = useState(false)
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null)
  const [setActionError, setSetActionError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const isBusy = deletingSetId !== null || isDeleting

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

  async function handleRemoveSet(set: TrainingSet) {
    if (!session || isBusy) return
    if (session.sets.length <= 1) return
    if (!window.confirm(`Remove set ${set.set_order}?`)) return

    setSetActionError('')
    setSuccessMessage('')
    setDeletingSetId(set.id)
    try {
      const deleted = await deleteTrainingSet(session.id, set.id)
      if (!deleted) return onSignedOut()
      setSession((current) => current ? {
        ...current, sets: current.sets.filter((item) => item.id !== set.id),
      } : current)
      setSuccessMessage('Set removed.')
    } catch (error) {
      setSetActionError(error instanceof Error ? error.message : 'Could not remove this set.')
    } finally {
      setDeletingSetId(null)
    }
  }

  async function handleDeleteSession() {
    if (!session || isBusy) return
    if (!window.confirm(`Permanently delete "${session.training_name}" on ${session.performed_on} and all its sets?`)) return

    setDeleteError('')
    setSuccessMessage('')
    setIsDeleting(true)
    try {
      const deleted = await deleteTrainingSession(session.id)
      if (!deleted) return onSignedOut()
      onBack()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this training session.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isAddingSet && session) {
    return <AddSetForm
      sessionId={session.id}
      category={session.category}
      onSignedOut={onSignedOut}
      onCancel={() => setIsAddingSet(false)}
      onSaved={(created) => {
        setSession({ ...session, sets: [...session.sets, created] })
        setIsAddingSet(false)
        setSuccessMessage('Set added.')
      }}
    />
  }

  if (editingSet && session) {
    return <EditSetForm
      key={editingSet.id}
      sessionId={session.id}
      set={editingSet}
      category={session.category}
      onSignedOut={onSignedOut}
      onCancel={() => setEditingSet(null)}
      onSaved={(updated) => {
        setSession({ ...session, sets: session.sets.map((set) => set.id === updated.id ? updated : set) })
        setEditingSet(null)
        setSuccessMessage('Set updated.')
      }}
    />
  }

  if (isEditing && session) {
    return <EditSessionForm
      session={session}
      onSignedOut={onSignedOut}
      onCancel={() => setIsEditing(false)}
      onSaved={(updated) => {
        setSession({ ...session, ...updated })
        setIsEditing(false)
        setSuccessMessage('Session updated.')
      }}
    />
  }

  return (
    <section aria-label="Session details">
      <button
        type="button"
        onClick={onBack}
        disabled={isBusy}
        className="mb-6 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:focus-visible:outline-emerald-400"
      >
        {backLabel}
      </button>

      {isLoading ? (
        <p role="status" className="text-slate-600 dark:text-slate-300">Loading session…</p>
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-6">
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button type="button" onClick={retry} className="mt-3 cursor-pointer font-medium text-emerald-700 dark:text-emerald-400 underline">
            Try again
          </button>
        </div>
      ) : session && (
        <>
          <header className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="min-w-0 break-words text-2xl font-semibold">{session.training_name}</h2>
              <div className="flex flex-wrap gap-3">
                <button type="button" disabled={isBusy} onClick={() => { setSuccessMessage(''); setIsEditing(true) }} className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">Edit session</button>
                <button type="button" disabled={isBusy} onClick={handleDeleteSession} className="cursor-pointer rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-60">{isDeleting ? 'Deleting…' : 'Delete session'}</button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <time dateTime={session.performed_on}>{session.performed_on}</time>
              {' · '}
              {session.category === 'cardio' ? 'Cardio' : session.category === 'bodyweight_reps' ? 'Bodyweight' : 'Weighted strength'}
            </p>
            {session.notes && <p className="mt-4 whitespace-pre-wrap break-words text-slate-600 dark:text-slate-300">{session.notes}</p>}
          </header>

          {successMessage && <p role="status" className="mb-4 text-sm text-emerald-800 dark:text-emerald-300">{successMessage}</p>}

          {deleteError && <p role="alert" className="mb-4 text-sm text-red-700 dark:text-red-400">{deleteError}</p>}

          {setActionError && <p role="alert" className="mb-4 text-sm text-red-700 dark:text-red-400">{setActionError}</p>}

          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Sets</h3>
            <button type="button" disabled={isBusy} onClick={() => { setSuccessMessage(''); setSetActionError(''); setIsAddingSet(true) }} className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60">Add set</button>
          </div>
          {session.sets.length === 1 && <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">A session must keep at least one set.</p>}
          {session.sets.length === 0 && <p className="text-slate-600 dark:text-slate-300">No sets saved.</p>}
          <ol className="space-y-3">
            {session.sets.map((set) => (
              <li key={set.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="font-medium">Set {set.set_order}</h4>
                  <div className="flex gap-4 text-sm font-medium">
                    <button type="button" disabled={isBusy} onClick={() => { setSuccessMessage(''); setSetActionError(''); setEditingSet(set) }} className="cursor-pointer text-emerald-700 dark:text-emerald-400 underline disabled:opacity-60">Edit set</button>
                    <button type="button" disabled={isBusy || session.sets.length <= 1} onClick={() => handleRemoveSet(set)} className="cursor-pointer text-red-700 dark:text-red-400 underline disabled:cursor-not-allowed disabled:opacity-50">{deletingSetId === set.id ? 'Removing…' : 'Remove set'}</button>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  {session.category === 'cardio' ? (
                    <>
                      {set.duration_seconds !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Duration</dt><dd className="mt-1 font-medium">{Math.floor(set.duration_seconds / 60)}:{String(set.duration_seconds % 60).padStart(2, '0')} min</dd></div>
                      )}
                      {set.distance_km !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Distance</dt><dd className="mt-1 font-medium">{displayDistance(set.distance_km, unitSystem)} {unitSystem === 'imperial' ? 'mi' : 'km'}</dd></div>
                      )}
                      {set.avg_heart_rate_bpm !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Avg. heart rate</dt><dd className="mt-1 font-medium">{set.avg_heart_rate_bpm} bpm</dd></div>
                      )}
                      {set.avg_power_watts !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Avg. power</dt><dd className="mt-1 font-medium">{Number(set.avg_power_watts)} W</dd></div>
                      )}
                      {set.avg_cadence !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Avg. cadence</dt><dd className="mt-1 font-medium">{Number(set.avg_cadence)}</dd></div>
                      )}
                      {set.elevation_gain_m !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Elevation gain</dt><dd className="mt-1 font-medium">{displayElevation(set.elevation_gain_m, unitSystem)} {unitSystem === 'imperial' ? 'ft' : 'm'}</dd></div>
                      )}
                    </>
                  ) : (
                    <>
                      {set.reps !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">Reps</dt><dd className="mt-1 font-medium">{Number(set.reps)}</dd></div>
                      )}
                      {set.weight_kg !== null && (
                        <div><dt className="text-slate-500 dark:text-slate-400">{session.category === 'bodyweight_reps' ? 'Added weight' : 'Weight'}</dt><dd className="mt-1 font-medium">{displayWeight(set.weight_kg, unitSystem)} {unitSystem === 'imperial' ? 'lb' : 'kg'}</dd></div>
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
