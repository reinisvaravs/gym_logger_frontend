import { useState, type FormEvent } from 'react'
import { deleteTrainingType, renameTrainingType, setTrainingTypeArchived, type TrainingType } from '../api/trainingTypes'

type TrainingTypeItemProps = {
  trainingType: TrainingType
  onUpdated: (trainingType: TrainingType) => void
  onDeleted: (id: string) => void
  onSignedOut: () => void
}

function TrainingTypeItem({ trainingType, onUpdated, onDeleted, onSignedOut }: TrainingTypeItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(trainingType.training_name)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return
    setError('')
    if (!name.trim() || name.trim().length > 100) {
      setError('Name must contain between 1 and 100 characters.')
      return
    }
    setIsSaving(true)
    try {
      const updated = await renameTrainingType(trainingType.id, name)
      if (!updated) return onSignedOut()
      onUpdated(updated)
      setIsEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not rename this training type.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleArchive() {
    if (isSaving) return
    setError('')
    setIsSaving(true)
    try {
      const updated = await setTrainingTypeArchived(trainingType.id, trainingType.archived_at === null)
      if (!updated) return onSignedOut()
      onUpdated(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update this training type.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (isSaving || !window.confirm(`Permanently delete "${trainingType.training_name}"?`)) return
    setError('')
    setIsSaving(true)
    try {
      const deleted = await deleteTrainingType(trainingType.id)
      if (!deleted) return onSignedOut()
      onDeleted(trainingType.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not delete this training type.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5" aria-busy={isSaving}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="break-words font-semibold">{trainingType.training_name}</h3>
        {trainingType.archived_at && <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">Archived</span>}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {trainingType.category === 'cardio' ? 'Cardio' : trainingType.category === 'bodyweight_reps' ? 'Bodyweight' : 'Weighted strength'}
      </p>

      {isEditing ? (
        <form onSubmit={handleRename} className="mt-4">
          <fieldset disabled={isSaving} className="space-y-3">
            <label htmlFor={`name-${trainingType.id}`} className="block text-sm font-medium">Training name</label>
            <input
              id={`name-${trainingType.id}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-emerald-700"
            />
            <div className="flex gap-4 text-sm font-medium">
              <button type="submit" className="cursor-pointer text-emerald-700 underline disabled:opacity-60">{isSaving ? 'Saving…' : 'Save name'}</button>
              <button type="button" onClick={() => { setIsEditing(false); setError('') }} className="cursor-pointer text-slate-600 underline">Cancel</button>
            </div>
          </fieldset>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
          <button type="button" disabled={isSaving} onClick={() => { setName(trainingType.training_name); setError(''); setIsEditing(true) }} className="cursor-pointer text-emerald-700 underline disabled:opacity-60">Rename</button>
          <button type="button" disabled={isSaving} onClick={handleArchive} className="cursor-pointer text-slate-600 underline disabled:opacity-60">{trainingType.archived_at ? 'Restore' : 'Archive'}</button>
          <button type="button" disabled={isSaving} onClick={handleDelete} className="cursor-pointer text-red-700 underline disabled:opacity-60">Delete</button>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </li>
  )
}

export default TrainingTypeItem
