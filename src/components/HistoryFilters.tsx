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
  const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 focus:outline-emerald-700 dark:focus:outline-emerald-400'

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
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5" aria-label="Filter training history">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="history-search" className="block text-sm font-medium">Exercise or activity</label>
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
      {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" disabled={isLoading} className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60">Apply filters</button>
        <button type="button" disabled={isLoading} onClick={clear} className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">Clear filters</button>
      </div>
    </form>
  )
}

export default HistoryFilters
