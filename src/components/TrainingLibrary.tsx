import { useEffect, useState, type FormEvent } from 'react'
import { createTrainingType, getTrainingTypes, type TrainingCategory, type TrainingType } from '../api/trainingTypes'
import TrainingTypeItem from './TrainingTypeItem'

type TrainingLibraryProps = {
  hideBack?: boolean
  backLabel?: string
  onBack: () => void
  onSignedOut: () => void
}

function TrainingLibrary({ onBack, onSignedOut, backLabel = 'Back to history', hideBack = false }: TrainingLibraryProps) {
  const [types, setTypes] = useState<TrainingType[]>([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TrainingCategory>('weighted_reps')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    getTrainingTypes()
      .then((data) => {
        if (!active) return
        if (data === null) return onSignedOut()
        setTypes(data)
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : 'Could not load your training library.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => { active = false }
  }, [onSignedOut, retryCount])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return
    setFormError('')
    if (!name.trim() || name.trim().length > 100) {
      setFormError('Name must contain between 1 and 100 characters.')
      return
    }
    setIsSaving(true)
    try {
      const created = await createTrainingType(name, category)
      if (!created) return onSignedOut()
      setTypes((current) => [...current, created])
      setName('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create this training type.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section aria-labelledby="library-heading">
      {!hideBack && <button type="button" onClick={onBack} className="btn btn-secondary mb-6">
        {backLabel}
      </button>}
      <header className="page-heading">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h2 id="library-heading">Training library</h2>
        <p className="page-subtitle">Your exercises and activities, ready for the next session.</p>
      </header>

      {isLoading ? (
        <p role="status" className="loading-state">Loading training library…</p>
      ) : error ? (
        <div className="mt-6">
          <p role="alert" className="notice notice-error">{error}</p>
          <button type="button" onClick={() => { setError(''); setIsLoading(true); setRetryCount(retryCount + 1) }} className="text-link mt-3">Try again</button>
        </div>
      ) : (
        <div className="library-layout">
          <form onSubmit={handleCreate} className="panel my-6" aria-busy={isSaving}>
            <h3 className="mb-4 font-semibold">Add an exercise</h3>
            <fieldset disabled={isSaving} className="space-y-4">
              <div>
                <label htmlFor="training-name" className="block text-sm font-medium">Name</label>
                <input id="training-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} placeholder="e.g. Squat or Running" className="field" />
              </div>
              <div>
                <label htmlFor="training-category" className="block text-sm font-medium">Category</label>
                <select id="training-category" value={category} onChange={(event) => setCategory(event.target.value as TrainingCategory)} className="field">
                  <option value="weighted_reps">Weighted strength</option>
                  <option value="bodyweight_reps">Bodyweight</option>
                  <option value="cardio">Cardio</option>
                </select>
              </div>
              {formError && <p role="alert" className="notice notice-error">{formError}</p>}
              <button type="submit" className="btn btn-primary">{isSaving ? 'Adding…' : 'Add to library'}</button>
            </fieldset>
          </form>

          {types.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">No training types yet. Add your first exercise or activity above.</p>
          ) : (
            <ul className="space-y-3">
              {[...types].sort((a, b) => a.training_name.localeCompare(b.training_name)).map((type) => (
                <TrainingTypeItem
                  key={type.id}
                  trainingType={type}
                  onSignedOut={onSignedOut}
                  onUpdated={(updated) => setTypes((current) => current.map((item) => item.id === updated.id ? updated : item))}
                  onDeleted={(id) => setTypes((current) => current.filter((item) => item.id !== id))}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default TrainingLibrary
