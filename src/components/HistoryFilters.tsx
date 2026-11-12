import { useState, type FormEvent } from 'react'
import type { TrainingSessionFilters } from '../api/trainingSessions'

type HistoryFiltersProps = {
  initialFilters: TrainingSessionFilters
  isLoading: boolean
  onApply: (filters: TrainingSessionFilters) => void
}

function HistoryFilters({ initialFilters, isLoading, onApply }: HistoryFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search)
  const [category, setCategory] = useState(initialFilters.category)
  const [from, setFrom] = useState(initialFilters.from)
  const [to, setTo] = useState(initialFilters.to)
  const [error, setError] = useState('')
  const inputClass = 'field'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isLoading) return
    setError('')
    if (from && to && from > to) {
      setError('The start date cannot be later than the end date.')
      return
    }
    onApply({ search: search.trim(), category, from, to })
  }

  function clear() {
    setSearch('')
    setCategory('')
    setFrom('')
    setTo('')
    setError('')
    onApply({ search: '', category: '', from: '', to: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="filter-panel" aria-label="Filter training history">
      <div className="filter-fields">
        <div>
          <label htmlFor="history-search" className="block text-sm font-medium">Search sessions</label>
          <input id="history-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={100} placeholder="Search by name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="history-category" className="block text-sm font-medium">Category</label>
          <select id="history-category" value={category} onChange={(event) => setCategory(event.target.value as TrainingSessionFilters['category'])} className={inputClass}>
            <option value="">All training</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>
        <div>
          <label htmlFor="history-from" className="block text-sm font-medium">From</label>
          <input id="history-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="history-to" className="block text-sm font-medium">To</label>
          <input id="history-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} className={inputClass} />
        </div>
      </div>
      {error && <p role="alert" className="notice notice-error">{error}</p>}
      <div className="filter-actions">
        <button type="submit" disabled={isLoading} className="btn btn-primary">Apply filters</button>
        <button type="button" disabled={isLoading} onClick={clear} className="btn btn-secondary">Reset</button>
      </div>
    </form>
  )
}

export default HistoryFilters
