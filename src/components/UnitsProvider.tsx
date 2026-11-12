import { useState, type ReactNode } from 'react'
import { UnitsContext } from '../UnitsContext'
import type { UnitSystem } from '../units'

function UnitsProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnits] = useState<UnitSystem>(() => {
    try {
      return localStorage.getItem('gym-units') === 'imperial' ? 'imperial' : 'metric'
    } catch {
      return 'metric'
    }
  })

  function setUnitSystem(units: UnitSystem) {
    setUnits(units)
    try {
      localStorage.setItem('gym-units', units)
    } catch {
      // The selection still works for this visit.
    }
  }

  return <UnitsContext.Provider value={{ unitSystem, setUnitSystem }}>{children}</UnitsContext.Provider>
}

export default UnitsProvider
