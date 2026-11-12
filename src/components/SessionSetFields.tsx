import type { TrainingCategory } from '../api/trainingTypes'

type SessionSetFieldsProps = {
  setId: number
  category: TrainingCategory
}

function SessionSetFields({ setId, category }: SessionSetFieldsProps) {
  const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-emerald-700'

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {category === 'cardio' ? (
          <>
            <div>
              <label htmlFor={`duration-${setId}`} className="block text-sm font-medium">Duration (seconds)</label>
              <input id={`duration-${setId}`} name={`durationSeconds-${setId}`} type="number" min="1" step="1" required className={inputClass} />
            </div>
            <div>
              <label htmlFor={`distance-${setId}`} className="block text-sm font-medium">Distance (km)</label>
              <input id={`distance-${setId}`} name={`distanceKm-${setId}`} type="number" min="0" step="0.001" required className={inputClass} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor={`reps-${setId}`} className="block text-sm font-medium">Reps</label>
              <input id={`reps-${setId}`} name={`reps-${setId}`} type="number" min="0.01" step="0.01" required className={inputClass} />
            </div>
            <div>
              <label htmlFor={`weight-${setId}`} className="block text-sm font-medium">
                {category === 'bodyweight_reps' ? 'Added weight (kg, optional)' : 'Weight (kg)'}
              </label>
              <input id={`weight-${setId}`} name={`weightKg-${setId}`} type="number" min="0" step="0.001" required={category === 'weighted_reps'} className={inputClass} />
            </div>
          </>
        )}
      </div>

      {category === 'cardio' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-600">Optional measurements</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`heart-rate-${setId}`} className="block text-sm font-medium">Avg. heart rate (bpm)</label>
              <input id={`heart-rate-${setId}`} name={`avgHeartRateBpm-${setId}`} type="number" min="20" max="250" step="1" className={inputClass} />
            </div>
            <div>
              <label htmlFor={`power-${setId}`} className="block text-sm font-medium">Avg. power (W)</label>
              <input id={`power-${setId}`} name={`avgPowerWatts-${setId}`} type="number" min="0" step="0.01" className={inputClass} />
            </div>
            <div>
              <label htmlFor={`cadence-${setId}`} className="block text-sm font-medium">Avg. cadence</label>
              <input id={`cadence-${setId}`} name={`avgCadence-${setId}`} type="number" min="0" step="0.01" className={inputClass} />
            </div>
            <div>
              <label htmlFor={`elevation-${setId}`} className="block text-sm font-medium">Elevation gain (m)</label>
              <input id={`elevation-${setId}`} name={`elevationGainM-${setId}`} type="number" min="0" step="0.001" className={inputClass} />
            </div>
          </div>
        </details>
      )}
    </>
  )
}

export default SessionSetFields
