import TrashIcon from './TrashIcon'
import { useEffect, useState, type FormEvent } from 'react'
import { getTrainingTypes, type TrainingType } from '../api/trainingTypes'
import { createTrainingSession, getTrainingSessions } from '../api/trainingSessions'
import SessionSetFields from './SessionSetFields'
import { useUnits } from '../UnitsContext'
import { readSetInput } from '../readSetInput'

type CreateSessionFormProps = {
  hideBack?: boolean
  initialDate?: string
  backLabel?: string
  onBack: () => void
  onSaved: (sessionId: string) => void
  onManageTypes: () => void
  onSignedOut: () => void
}

function CreateSessionForm({ onBack, onSaved, onManageTypes, onSignedOut, initialDate, backLabel = 'Back to history', hideBack = false }: CreateSessionFormProps) {
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
    <section className="form-page" aria-labelledby="create-session-heading">
      {!hideBack && <button type="button" onClick={onBack} disabled={isSaving} className="btn btn-secondary mb-6">{backLabel}</button>}
      <h2 id="create-session-heading" className="text-2xl font-semibold">Log a session</h2>
      <p className="page-subtitle">Choose your exercise and record the work. One set at a time.</p>
      {unitSystem !== formUnits && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This form keeps its original units. Go back and reopen it to use your new preference.</p>}

      {isLoading ? (
        <p role="status" className="loading-state">Loading training types…</p>
      ) : loadError ? (
        <div className="mt-6">
          <p role="alert" className="notice notice-error">{loadError}</p>
          <button type="button" onClick={() => { setLoadError(''); setIsLoading(true); setRetryCount(retryCount + 1) }} className="text-link mt-3">Try again</button>
        </div>
      ) : types.length === 0 ? (
        <div className="panel mt-6">
          <p className="text-slate-600 dark:text-slate-300">Add or restore a training type before logging a session.</p>
          <button type="button" onClick={onManageTypes} className="text-link mt-3">Open training library</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6" aria-busy={isSaving}>
          <fieldset disabled={isSaving} className="space-y-6">
            <div className="panel space-y-4">
              <div>
                <label htmlFor="session-type" className="block text-sm font-medium">Exercise or activity</label>
                <select id="session-type" value={typeId} onChange={(event) => { setTypeId(event.target.value); setSetIds([0]); setNextSetId(1); setError('') }} className="field">
                  {types.map((type) => <option key={type.id} value={type.id}>{type.training_name}</option>)}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Changing the exercise clears the entered sets.</p>
              </div>
              <div>
                <label htmlFor="session-date" className="block text-sm font-medium">Date</label>
                <input id="session-date" name="performedOn" type="date" required defaultValue={initialDate || today} className="field" />
              </div>
              <div>
                <label htmlFor="session-notes" className="block text-sm font-medium">Notes (optional)</label>
                <textarea id="session-notes" name="notes" rows={3} className="field" />
              </div>
            </div>

            {selectedType && setIds.map((id, index) => (
              <div key={`${selectedType.id}-${id}`} className="panel">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-semibold">Set {index + 1}</h3>
                  {setIds.length > 1 && <button type="button" onClick={() => setSetIds(setIds.filter((setId) => setId !== id))} className="icon-button danger" aria-label={`Remove set ${index + 1}`} title="Remove set"><TrashIcon /></button>}
                </div>
                <SessionSetFields units={formUnits} setId={id} category={selectedType.category} />
              </div>
            ))}

            <button type="button" onClick={() => { setSetIds([...setIds, nextSetId]); setNextSetId(nextSetId + 1) }} className="btn btn-secondary">Add set</button>
            {error && <p role="alert" className="notice notice-error">{error}</p>}
            <button type="submit" className="btn btn-primary w-full">{isSaving ? 'Saving session…' : 'Save session'}</button>
          </fieldset>
        </form>
      )}
    </section>
  )
}

export default CreateSessionForm
