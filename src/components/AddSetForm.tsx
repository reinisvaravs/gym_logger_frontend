import { useState, type FormEvent } from 'react'
import { addTrainingSet, type TrainingSet } from '../api/trainingSessions'
import type { TrainingCategory } from '../api/trainingTypes'
import SessionSetFields from './SessionSetFields'

type AddSetFormProps = {
  sessionId: string
  category: TrainingCategory
  onSaved: (set: TrainingSet) => void
  onCancel: () => void
  onSignedOut: () => void
}

function AddSetForm({ sessionId, category, onSaved, onCancel, onSignedOut }: AddSetFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    const form = new FormData(event.currentTarget)
    function readNumber(name: string) {
      const value = form.get(`${name}-new`)
      return value === null || value === '' ? null : Number(value)
    }

    setError('')
    setIsSaving(true)
    try {
      const created = await addTrainingSet(sessionId, {
        reps: readNumber('reps'),
        weightKg: readNumber('weightKg'),
        durationSeconds: readNumber('durationSeconds'),
        distanceKm: readNumber('distanceKm'),
        avgHeartRateBpm: readNumber('avgHeartRateBpm'),
        avgPowerWatts: readNumber('avgPowerWatts'),
        avgCadence: readNumber('avgCadence'),
        elevationGainM: readNumber('elevationGainM'),
      })
      if (!created) return onSignedOut()
      onSaved(created)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not add this set.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section aria-labelledby="add-set-heading">
      <h2 id="add-set-heading" className="text-2xl font-semibold">Add a set</h2>
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-busy={isSaving}>
        <fieldset disabled={isSaving} className="space-y-5">
          <SessionSetFields setId="new" category={category} />
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Saving…' : 'Add set'}</button>
            <button type="button" onClick={onCancel} className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-60">Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}

export default AddSetForm
