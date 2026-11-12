import type { TrainingSet, TrainingSetInput } from './api/trainingSessions'
import { displayWeight, displayDistance, displayElevation, metricWeight, metricDistance, metricElevation, type UnitSystem } from './units'

export function readSetInput(form: FormData, id: number | string, units: UnitSystem, initialSet?: TrainingSet): TrainingSetInput {
  function readNumber(name: string) {
    const value = form.get(`${name}-${id}`)
    return value === null || value === '' ? null : Number(value)
  }

  const weight = readNumber('weightKg')
  const distance = readNumber('distanceKm')
  const elevation = readNumber('elevationGainM')
  const durationMinutes = readNumber('durationMinutes')
  let weightKg = metricWeight(weight, units)
  let distanceKm = metricDistance(distance, units)
  let elevationGainM = metricElevation(elevation, units)

  // Saving unchanged converted inputs must not round the original stored values.
  if (initialSet?.weight_kg != null && weight === displayWeight(initialSet.weight_kg, units)) {
    weightKg = Number(initialSet.weight_kg)
  }
  if (initialSet?.distance_km != null && distance === displayDistance(initialSet.distance_km, units)) {
    distanceKm = Number(initialSet.distance_km)
  }
  if (initialSet?.elevation_gain_m != null && elevation === displayElevation(initialSet.elevation_gain_m, units)) {
    elevationGainM = Number(initialSet.elevation_gain_m)
  }

  return {
    reps: readNumber('reps'),
    weightKg,
    durationSeconds: durationMinutes === null ? null : Math.round(durationMinutes * 60),
    distanceKm,
    avgHeartRateBpm: readNumber('avgHeartRateBpm'),
    avgPowerWatts: readNumber('avgPowerWatts'),
    avgCadence: readNumber('avgCadence'),
    elevationGainM,
  }
}
