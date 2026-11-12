import { useEffect, useState, type FormEvent } from 'react'
import { getTrainingTypes, type TrainingType } from '../api/trainingTypes'
import { createTrainingSession, getTrainingSessions } from '../api/trainingSessions'
import SessionSetFields from './SessionSetFields'
import { useUnits } from '../UnitsContext'
import { readSetInput } from '../readSetInput'

type CreateSessionFormProps = {
  initialDate?: string
  backLabel?: string
  onBack: () => void
  onSaved: (sessionId: string) => void
  onManageTypes: () => void
  onSignedOut: () => void
}

function CreateSessionForm({ onBack, onSaved, onManageTypes, onSignedOut, initialDate, backLabel = 'Back to history' }: CreateSessionFormProps) {
  const { unitSystem } = useUnits()
  const [formUnits] = useState(unitSystem)
  const [types, setTypes] = useState<TrainingType[]>([])
  const [typeId, setTypeId] = useState('')
  const [setIds, setSetIds] = useState([0])
  const [nextSetId, setNextSetId] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const selectedType = types.find((type) => type.id === typeId)
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  useEffect(() => {
    let active = true
    getTrainingTypes()
      .then((data) => {
        if (!active) return
        if (data === null) return onSignedOut()
        const activeTypes = data.filter((type) => type.archived_at === null)
        setTypes(activeTypes)
        setTypeId(activeTypes[0]?.id || '')
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load training types.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [onSignedOut, retryCount])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving || !selectedType) return

    const form = new FormData(event.currentTarget)
    const performedOn = String(form.get('performedOn'))

    const sets = setIds.map((id) => readSetInput(form, id, formUnits))

    setError('')
    setIsSaving(true)
    try {
      const existingSessions = await getTrainingSessions(performedOn, performedOn)
      if (existingSessions === null) return onSignedOut()
      const sessionOrder = existingSessions.reduce((highest, session) => Math.max(highest, session.session_order), 0) + 1

      const created = await createTrainingSession({
        trainingTypeId: selectedType.id,
        performedOn,
        sessionOrder,
        notes: String(form.get('notes') || ''),
        sets,
      })
      if (!created) return onSignedOut()
      onSaved(created.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save your training session.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section aria-labelledby="create-session-heading">
      <button type="button" onClick={onBack} disabled={isSaving} className="mb-6 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">{backLabel}</button>
      <h2 id="create-session-heading" className="text-2xl font-semibold">Log a session</h2>
      {unitSystem !== formUnits && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This form keeps its original units. Go back and reopen it to use your new preference.</p>}

      {isLoading ? (
        <p role="status" className="mt-6 text-slate-600 dark:text-slate-300">Loading training types…</p>
      ) : loadError ? (
        <div className="mt-6">
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
          <button type="button" onClick={() => { setLoadError(''); setIsLoading(true); setRetryCount(retryCount + 1) }} className="mt-3 cursor-pointer text-emerald-700 dark:text-emerald-400 underline">Try again</button>
        </div>
      ) : types.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <p className="text-slate-600 dark:text-slate-300">Add or restore a training type before logging a session.</p>
          <button type="button" onClick={onManageTypes} className="mt-3 cursor-pointer font-medium text-emerald-700 dark:text-emerald-400 underline">Open training library</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6" aria-busy={isSaving}>
          <fieldset disabled={isSaving} className="space-y-6">
            <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div>
                <label htmlFor="session-type" className="block text-sm font-medium">Exercise or activity</label>
                <select id="session-type" value={typeId} onChange={(event) => { setTypeId(event.target.value); setSetIds([0]); setNextSetId(1); setError('') }} className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400">
                  {types.map((type) => <option key={type.id} value={type.id}>{type.training_name}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Changing the exercise clears the entered sets.</p>
              </div>
              <div>
                <label htmlFor="session-date" className="block text-sm font-medium">Date</label>
                <input id="session-date" name="performedOn" type="date" required defaultValue={initialDate || today} className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400" />
              </div>
              <div>
                <label htmlFor="session-notes" className="block text-sm font-medium">Notes (optional)</label>
                <textarea id="session-notes" name="notes" rows={3} className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400" />
              </div>
            </div>

            {selectedType && setIds.map((id, index) => (
              <div key={`${selectedType.id}-${id}`} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-semibold">Set {index + 1}</h3>
                  {setIds.length > 1 && <button type="button" onClick={() => setSetIds(setIds.filter((setId) => setId !== id))} className="cursor-pointer text-sm text-red-700 dark:text-red-400 underline">Remove set</button>}
                </div>
                <SessionSetFields units={formUnits} setId={id} category={selectedType.category} />
              </div>
            ))}

            <button type="button" onClick={() => { setSetIds([...setIds, nextSetId]); setNextSetId(nextSetId + 1) }} className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Add set</button>
            {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
            <button type="submit" className="block w-full cursor-pointer rounded-lg bg-emerald-700 px-4 py-3 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Saving session…' : 'Save session'}</button>
          </fieldset>
        </form>
      )}
    </section>
  )
}

export default CreateSessionForm
