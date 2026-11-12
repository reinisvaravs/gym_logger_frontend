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
    <section aria-labelledby="edit-session-heading">
      <h2 id="edit-session-heading" className="text-2xl font-semibold">Edit session</h2>
      <p className="mt-2 break-words text-slate-600">{session.training_name}</p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="space-y-5">
          <div>
            <label htmlFor="edit-session-date" className="block text-sm font-medium">Date</label>
            <input id="edit-session-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-emerald-700" />
          </div>
          <div>
            <label htmlFor="edit-session-notes" className="block text-sm font-medium">Notes (optional)</label>
            <textarea id="edit-session-notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-emerald-700" />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={onCancel} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-60">Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}

export default EditSessionForm
