import { useEffect, useState, type FormEvent } from 'react'
import { createTrainingType, getTrainingTypes, type TrainingCategory, type TrainingType } from '../api/trainingTypes'
import TrainingTypeItem from './TrainingTypeItem'

type TrainingLibraryProps = {
  backLabel?: string
  onBack: () => void
  onSignedOut: () => void
}

function TrainingLibrary({ onBack, onSignedOut, backLabel = 'Back to history' }: TrainingLibraryProps) {
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
      <button type="button" onClick={onBack} className="mb-6 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
        {backLabel}
      </button>
      <h2 id="library-heading" className="text-2xl font-semibold">Training library</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Your exercises and activities. Archive types you no longer use to keep their history.</p>

      {isLoading ? (
        <p role="status" className="mt-6 text-slate-600 dark:text-slate-300">Loading training library…</p>
      ) : error ? (
        <div className="mt-6">
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button type="button" onClick={() => { setError(''); setIsLoading(true); setRetryCount(retryCount + 1) }} className="mt-3 cursor-pointer text-emerald-700 dark:text-emerald-400 underline">Try again</button>
        </div>
      ) : (
        <>
          <form onSubmit={handleCreate} className="my-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5" aria-busy={isSaving}>
            <h3 className="mb-4 font-semibold">Add a training type</h3>
            <fieldset disabled={isSaving} className="space-y-4">
              <div>
                <label htmlFor="training-name" className="block text-sm font-medium">Name</label>
                <input id="training-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} placeholder="e.g. Squat or Running" className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400" />
              </div>
              <div>
                <label htmlFor="training-category" className="block text-sm font-medium">Category</label>
                <select id="training-category" value={category} onChange={(event) => setCategory(event.target.value as TrainingCategory)} className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400">
                  <option value="weighted_reps">Weighted strength</option>
                  <option value="bodyweight_reps">Bodyweight</option>
                  <option value="cardio">Cardio</option>
                </select>
              </div>
              {formError && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{formError}</p>}
              <button type="submit" className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Adding…' : 'Add training type'}</button>
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
        </>
      )}
    </section>
  )
}

export default TrainingLibrary
