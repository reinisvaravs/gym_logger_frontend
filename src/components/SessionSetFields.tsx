import type { TrainingCategory } from '../api/trainingTypes'
import type { TrainingSet } from '../api/trainingSessions'
import { displayWeight, displayDistance, displayElevation, type UnitSystem } from '../units'

type SessionSetFieldsProps = {
  setId: number | string
  category: TrainingCategory
  initialSet?: TrainingSet
  units: UnitSystem
}

function SessionSetFields({ setId, category, initialSet, units }: SessionSetFieldsProps) {
  const weightUnit = units === 'imperial' ? 'lb' : 'kg'
  const distanceUnit = units === 'imperial' ? 'mi' : 'km'
  const elevationUnit = units === 'imperial' ? 'ft' : 'm'
  const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400'

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {category === 'cardio' ? (
          <>
            <div>
              <label htmlFor={`duration-${setId}`} className="block text-sm font-medium">Duration (minutes)</label>
              <input id={`duration-${setId}`} name={`durationMinutes-${setId}`} type="number" min={1 / 60} step="any" required defaultValue={initialSet?.duration_seconds != null ? initialSet.duration_seconds / 60 : ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`distance-${setId}`} className="block text-sm font-medium">Distance ({distanceUnit})</label>
              <input id={`distance-${setId}`} name={`distanceKm-${setId}`} type="number" min="0" step="0.001" required defaultValue={initialSet?.distance_km != null ? displayDistance(initialSet.distance_km, units) : ''} className={inputClass} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor={`reps-${setId}`} className="block text-sm font-medium">Reps</label>
              <input id={`reps-${setId}`} name={`reps-${setId}`} type="number" min="0.01" step="0.01" required defaultValue={initialSet?.reps ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`weight-${setId}`} className="block text-sm font-medium">
                {category === 'bodyweight_reps' ? `Added weight (${weightUnit}, optional)` : `Weight (${weightUnit})`}
              </label>
              <input id={`weight-${setId}`} name={`weightKg-${setId}`} type="number" min="0" step="0.001" required={category === 'weighted_reps'} defaultValue={initialSet?.weight_kg != null ? displayWeight(initialSet.weight_kg, units) : ''} className={inputClass} />
            </div>
          </>
        )}
      </div>

      {category === 'cardio' && (
        <details className="mt-4" open={initialSet !== undefined}>
          <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">Optional measurements</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`heart-rate-${setId}`} className="block text-sm font-medium">Avg. heart rate (bpm)</label>
              <input id={`heart-rate-${setId}`} name={`avgHeartRateBpm-${setId}`} type="number" min="20" max="250" step="1" defaultValue={initialSet?.avg_heart_rate_bpm ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`power-${setId}`} className="block text-sm font-medium">Avg. power (W)</label>
              <input id={`power-${setId}`} name={`avgPowerWatts-${setId}`} type="number" min="0" step="0.01" defaultValue={initialSet?.avg_power_watts ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`cadence-${setId}`} className="block text-sm font-medium">Avg. cadence</label>
              <input id={`cadence-${setId}`} name={`avgCadence-${setId}`} type="number" min="0" step="0.01" defaultValue={initialSet?.avg_cadence ?? ''} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`elevation-${setId}`} className="block text-sm font-medium">Elevation gain ({elevationUnit})</label>
              <input id={`elevation-${setId}`} name={`elevationGainM-${setId}`} type="number" min="0" step="0.001" defaultValue={initialSet?.elevation_gain_m != null ? displayElevation(initialSet.elevation_gain_m, units) : ''} className={inputClass} />
            </div>
          </div>
        </details>
      )}
    </>
  )
}

export default SessionSetFields
