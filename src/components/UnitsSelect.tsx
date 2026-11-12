import { useUnits } from '../UnitsContext'

function UnitsSelect() {
  const { unitSystem, setUnitSystem } = useUnits()

  return (
    <div>
      <label htmlFor="unit-system" className="block text-sm font-medium">Measurement units</label>
      <select
        id="unit-system"
        value={unitSystem}
        onChange={(event) => setUnitSystem(event.target.value === 'imperial' ? 'imperial' : 'metric')}
        className="field"
      >
        <option value="metric">Metric (kg, km)</option>
        <option value="imperial">Imperial (lb, mi)</option>
      </select>
    </div>
  )
}

export default UnitsSelect
