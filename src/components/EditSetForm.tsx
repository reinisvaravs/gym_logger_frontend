import { useState, type FormEvent } from 'react'
import { updateTrainingSet, type TrainingSet } from '../api/trainingSessions'
import type { TrainingCategory } from '../api/trainingTypes'
import SessionSetFields from './SessionSetFields'
import { useUnits } from '../UnitsContext'
import { readSetInput } from '../readSetInput'

type EditSetFormProps = {
  sessionId: string
  set: TrainingSet
  category: TrainingCategory
  onSaved: (set: TrainingSet) => void
  onCancel: () => void
  onSignedOut: () => void
}

function EditSetForm({ sessionId, set, category, onSaved, onCancel, onSignedOut }: EditSetFormProps) {
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
      const updated = await updateTrainingSet(sessionId, set.id, readSetInput(form, set.id, formUnits, set))
      if (!updated) return onSignedOut()
      onSaved(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update this set.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="form-page" aria-labelledby="edit-set-heading">
      <h2 id="edit-set-heading" className="text-2xl font-semibold">Edit set {set.set_order}</h2>
      {unitSystem !== formUnits && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This form keeps its original units. Cancel and reopen it to use your new preference.</p>}
      <form onSubmit={handleSubmit} className="panel mt-6" aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="space-y-5">
          <SessionSetFields units={formUnits} setId={set.id} category={category} initialSet={set} />
          {error && <p role="alert" className="notice notice-error">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">{isSaving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}

export default EditSetForm
