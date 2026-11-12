import { useUnits } from '../UnitsContext'

function UnitsSelect() {
  const { unitSystem, setUnitSystem } = useUnits()

  return (
    <div>
      <label htmlFor="unit-system" className="sr-only">Measurement units</label>
      <select
        id="unit-system"
        value={unitSystem}
        onChange={(event) => setUnitSystem(event.target.value === 'imperial' ? 'imperial' : 'metric')}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 focus:outline-emerald-700 dark:focus:outline-emerald-400"
      >
        <option value="metric">Metric (kg, km)</option>
        <option value="imperial">Imperial (lb, mi)</option>
      </select>
    </div>
  )
}

export default UnitsSelect
