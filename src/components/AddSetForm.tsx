import { useState, type FormEvent } from 'react'
import { addTrainingSet, type TrainingSet } from '../api/trainingSessions'
import type { TrainingCategory } from '../api/trainingTypes'
import SessionSetFields from './SessionSetFields'
import { useUnits } from '../UnitsContext'
import { readSetInput } from '../readSetInput'

type AddSetFormProps = {
  sessionId: string
  category: TrainingCategory
  onSaved: (set: TrainingSet) => void
  onCancel: () => void
  onSignedOut: () => void
}

function AddSetForm({ sessionId, category, onSaved, onCancel, onSignedOut }: AddSetFormProps) {
  const { unitSystem } = useUnits()
  const [formUnits] = useState(unitSystem)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    const form = new FormData(event.currentTarget)
    setError('')
    setIsSaving(true)
    try {
      const created = await addTrainingSet(sessionId, readSetInput(form, 'new', formUnits))
      if (!created) return onSignedOut()
      onSaved(created)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not add this set.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="form-page" aria-labelledby="add-set-heading">
      <h2 id="add-set-heading" className="text-2xl font-semibold">Add a set</h2>
      {unitSystem !== formUnits && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This form keeps its original units. Cancel and reopen it to use your new preference.</p>}
      <form onSubmit={handleSubmit} className="panel mt-6" aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="space-y-5">
          <SessionSetFields units={formUnits} setId="new" category={category} />
          {error && <p role="alert" className="notice notice-error">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">{isSaving ? 'Saving…' : 'Add set'}</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}

export default AddSetForm
