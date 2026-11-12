import TrashIcon from './TrashIcon'
import PencilIcon from './PencilIcon'
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
    <li className={`library-item ${trainingType.archived_at ? 'is-archived' : ''}`} aria-busy={isSaving}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="break-words font-semibold">{trainingType.training_name}</h3>
        {trainingType.archived_at && <span className="badge">Archived</span>}
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
              className="field"
            />
            <div className="flex gap-4 text-sm font-medium">
              <button type="submit" className="text-link">{isSaving ? 'Saving…' : 'Save name'}</button>
              <button type="button" onClick={() => { setIsEditing(false); setError('') }} className="text-link">Cancel</button>
            </div>
          </fieldset>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
          <button type="button" disabled={isSaving} onClick={() => { setName(trainingType.training_name); setError(''); setIsEditing(true) }} className="icon-button" aria-label={`Rename ${trainingType.training_name}`} title="Rename"><PencilIcon /></button>
          <button type="button" disabled={isSaving} onClick={handleArchive} className="text-link">{trainingType.archived_at ? 'Restore' : 'Archive'}</button>
          <button type="button" disabled={isSaving} onClick={handleDelete} className="icon-button danger" aria-label={`Delete ${trainingType.training_name}`} title="Delete"><TrashIcon /></button>
        </div>
      )}
      {error && <p role="alert" className="notice notice-error">{error}</p>}
    </li>
  )
}

export default TrainingTypeItem
