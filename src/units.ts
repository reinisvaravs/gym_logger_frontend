export type UnitSystem = 'metric' | 'imperial'

function round(value: number) {
  return Number(value.toFixed(3))
}

export function displayWeight(kg: number | string, units: UnitSystem) {
  return units === 'imperial' ? round(Number(kg) / 0.45359237) : Number(kg)
}

export function displayDistance(km: number | string, units: UnitSystem) {
  return units === 'imperial' ? round(Number(km) / 1.609344) : Number(km)
}

export function displaySpeed(kmPerHour: number, units: UnitSystem) {
  const speed = units === 'imperial' ? kmPerHour / 1.609344 : kmPerHour
  return Number(speed.toFixed(2))
}

export function displayElevation(metres: number | string, units: UnitSystem) {
  return units === 'imperial' ? round(Number(metres) / 0.3048) : Number(metres)
}

export function metricWeight(value: number | null, units: UnitSystem) {
  return value === null ? null : units === 'imperial' ? round(value * 0.45359237) : value
}

export function metricDistance(value: number | null, units: UnitSystem) {
  return value === null ? null : units === 'imperial' ? round(value * 1.609344) : value
}

export function metricElevation(value: number | null, units: UnitSystem) {
  return value === null ? null : units === 'imperial' ? round(value * 0.3048) : value
}
