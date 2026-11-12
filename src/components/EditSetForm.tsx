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
    <section aria-labelledby="edit-set-heading">
      <h2 id="edit-set-heading" className="text-2xl font-semibold">Edit set {set.set_order}</h2>
      {unitSystem !== formUnits && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This form keeps its original units. Cancel and reopen it to use your new preference.</p>}
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5" aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="space-y-5">
          <SessionSetFields units={formUnits} setId={set.id} category={category} initialSet={set} />
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={onCancel} className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}

export default EditSetForm
