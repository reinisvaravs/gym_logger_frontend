import { createContext, useContext } from 'react'
import type { UnitSystem } from './units'

export const UnitsContext = createContext<{
  unitSystem: UnitSystem
  setUnitSystem: (units: UnitSystem) => void
} | null>(null)

export function useUnits() {
  const context = useContext(UnitsContext)
  if (!context) throw new Error('Unit controls must be inside UnitsProvider')
  return context
}
