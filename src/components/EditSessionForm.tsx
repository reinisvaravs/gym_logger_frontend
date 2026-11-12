import { useState, type FormEvent } from 'react'
import { getTrainingSessions, updateTrainingSession, type TrainingSessionDetails, type TrainingSessionUpdate } from '../api/trainingSessions'

type EditSessionFormProps = {
  session: TrainingSessionDetails
  onSaved: (updated: TrainingSessionUpdate) => void
  onCancel: () => void
  onSignedOut: () => void
}

function EditSessionForm({ session, onSaved, onCancel, onSignedOut }: EditSessionFormProps) {
  const [date, setDate] = useState(session.performed_on)
  const [notes, setNotes] = useState(session.notes || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return
    setError('')
    setIsSaving(true)

    try {
      let order = session.session_order

      // A moved session goes after the existing sessions on its new date.
      if (date !== session.performed_on) {
        const sessions = await getTrainingSessions(date, date)
        if (sessions === null) return onSignedOut()
        order = sessions.reduce((highest, item) => Math.max(highest, item.session_order), 0) + 1
      }

      const updated = await updateTrainingSession(session.id, date, order, notes)
      if (!updated) return onSignedOut()
      onSaved(updated)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update this training session.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="form-page" aria-labelledby="edit-session-heading">
      <h2 id="edit-session-heading" className="text-2xl font-semibold">Edit session</h2>
      <p className="mt-2 break-words text-slate-600 dark:text-slate-300">{session.training_name}</p>

      <form onSubmit={handleSubmit} className="panel mt-6" aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="space-y-5">
          <div>
            <label htmlFor="edit-session-date" className="block text-sm font-medium">Date</label>
            <input id="edit-session-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="field" />
          </div>
          <div>
            <label htmlFor="edit-session-notes" className="block text-sm font-medium">Notes (optional)</label>
            <textarea id="edit-session-notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} className="field" />
          </div>

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

export default EditSessionForm
