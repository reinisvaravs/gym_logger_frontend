import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getStatistics, type Statistics } from '../api/statistics'
import { useUnits } from '../UnitsContext'
import { displayDistance } from '../units'
import { formatNumber, formatStatsDuration } from '../formatStats'
import ProgressMetric from './ProgressMetric'
import StrengthProgress from './StrengthProgress'
import CardioProgress from './CardioProgress'
import WeeklyActivityChart from './WeeklyActivityChart'

type View = 'overview' | 'strength' | 'cardio'
type ProgressPageProps = { onSignedOut: () => void }

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function ProgressPage({ onSignedOut }: ProgressPageProps) {
  const [params, setParams] = useSearchParams()
  const today = dateString(new Date())
  const range = params.get('range') || 'year'
  const to = params.get('to') || today
  const from = params.has('from') ? params.get('from') || '' : range === 'all' ? '' : `${today.slice(0, 4)}-01-01`
  const selectedView = params.get('view')
  const view: View = selectedView === 'strength' || selectedView === 'cardio' ? selectedView : 'overview'
  const [retry, setRetry] = useState(0)
  const [dateError, setDateError] = useState('')

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    if (key === 'exercise') next.delete('weight')
    setParams(next)
  }

  function changeRange(value: string) {
    if (value === 'custom') { update('range', value); return }
    const next = new URLSearchParams(params)
    next.set('range', value)
    next.set('to', today)
    const start = new Date(`${today}T00:00:00`)
    if (value === '30' || value === '90') start.setDate(start.getDate() - (Number(value) - 1))
    if (value === 'year') start.setMonth(0, 1)
    next.set('from', value === 'all' ? '' : dateString(start))
    setDateError('')
    setParams(next)
  }

  return <section aria-labelledby="progress-heading">
    <header className="page-heading"><div><p className="eyebrow">THE WORK ADDS UP</p><h2 id="progress-heading">Training progress</h2><p className="page-subtitle">Consistency, exercise records, and cardio history. Based on what you have logged.</p></div></header>
    <form key={`${from}:${to}`} className="panel progress-filters" onSubmit={(event) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      const start = String(form.get('from') || ''), end = String(form.get('to') || '')
      if (start && start > end) { setDateError('From cannot be later than To.'); return }
      setDateError('')
      const next = new URLSearchParams(params)
      next.set('range', 'custom'); next.set('from', start); next.set('to', end)
      setParams(next)
    }}>
      <label>Period<select className="field" value={range} onChange={(event) => changeRange(event.target.value)}><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="year">This year</option><option value="all">All history through today</option><option value="custom">Custom dates</option></select></label>
      <label>From<input className="field" type="date" name="from" defaultValue={from} /></label>
      <label>To<input className="field" type="date" name="to" required defaultValue={to} /></label>
      <button className="btn btn-secondary" type="submit">Apply dates</button>
    </form>
    {dateError && <p role="alert" className="notice notice-error mb-5">{dateError}</p>}
    <nav className="progress-tabs" aria-label="Progress sections">{(['overview', 'strength', 'cardio'] as const).map((tab) => <button type="button" key={tab} aria-current={view === tab ? 'page' : undefined} className={view === tab ? 'active' : ''} onClick={() => update('view', tab)}>{tab === 'overview' ? 'Overview' : tab === 'strength' ? 'Strength' : 'Cardio'}</button>)}</nav>
    <ProgressContent key={`${from}:${to}:${retry}`} from={from} to={to} view={view} exerciseId={params.get('exercise')} activityId={params.get('activity')} weight={params.get('weight')} onSelect={update} onSignedOut={onSignedOut} onRetry={() => setRetry(retry + 1)} />
  </section>
}

type ContentProps = {
  from: string; to: string; view: View; exerciseId: string | null; activityId: string | null; weight: string | null
  onSelect: (key: string, value: string) => void
  onSignedOut: () => void
  onRetry: () => void
}

function ProgressContent({ from, to, view, exerciseId, activityId, weight, onSelect, onSignedOut, onRetry }: ContentProps) {
  const [data, setData] = useState<Statistics | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { unitSystem } = useUnits()

  useEffect(() => {
    let active = true
    getStatistics(from, to).then((result) => {
      if (!active) return
      if (result === null) { onSignedOut(); return }
      setData(result)
    }).catch((error) => {
      if (active) setError(error instanceof Error ? error.message : 'Could not load your progress.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [from, to, onSignedOut])

  if (loading) return <p role="status" className="loading-state">Loading your progress…</p>
  if (error) return <div className="panel"><p role="alert" className="notice notice-error">{error}</p><button type="button" className="btn btn-secondary mt-4" onClick={onRetry}>Try again</button></div>
  if (!data) return null
  if (!data.overview.training_days) return <div className="panel progress-empty"><h3>No training in this period</h3><p>Choose a wider date range or log your first session.</p><Link to="/history/sessions/new" className="btn btn-primary mt-4">Log session</Link></div>

  if (view === 'strength') {
    const exercise = data.strength.find((item) => item.id === exerciseId) || data.strength[0]
    if (!exercise) return <p className="panel progress-empty">No strength training in this period.</p>
    return <><label className="progress-exercise-label">Exercise<select className="field" value={exercise.id} onChange={(event) => onSelect('exercise', event.target.value)}>{data.strength.map((item) => <option key={item.id} value={item.id}>{item.name}{item.archived ? ' (archived)' : ''}</option>)}</select></label><StrengthProgress key={exercise.id} exercise={exercise} weight={weight} onWeightChange={(value) => onSelect('weight', value)} /></>
  }
  if (view === 'cardio') {
    const activity = data.cardio.find((item) => item.id === activityId) || data.cardio[0]
    if (!activity) return <p className="panel progress-empty">No cardio training in this period.</p>
    return <><label className="progress-exercise-label">Activity<select className="field" value={activity.id} onChange={(event) => onSelect('activity', event.target.value)}>{data.cardio.map((item) => <option key={item.id} value={item.id}>{item.name}{item.archived ? ' (archived)' : ''}</option>)}</select></label><CardioProgress key={activity.id} activity={activity} /></>
  }

  const summary = data.overview
  const distanceUnit = unitSystem === 'imperial' ? 'mi' : 'km'
  return <div className="progress-stack">
    <div className="progress-metrics">
      <ProgressMetric label="Training days" value={summary.training_days} detail="Each calendar day counted once" />
      <ProgressMetric label="Strength sets" value={summary.strength_sets} detail="Across your strength exercises" />
      <ProgressMetric label="Cardio duration" value={formatStatsDuration(summary.cardio.duration_seconds)} detail="Includes sets without distance" />
      <ProgressMetric label="Recorded cardio distance" value={summary.cardio.distance_km === null ? '—' : `${formatNumber(displayDistance(summary.cardio.distance_km, unitSystem))} ${distanceUnit}`} detail={`Distance recorded for ${summary.cardio.distance_sets} of ${summary.cardio.set_count} sets`} />
    </div>
    <section className="panel"><div className="progress-panel-heading"><div><h3>Weekly consistency</h3><p>Latest 12 weeks within your selected period. Weeks start on Monday.</p></div></div>
      <div className="activity-legend"><span><i className="strength-key" />Strength days</span><span><i className="cardio-key" />Cardio days</span></div>
      <WeeklyActivityChart weeks={data.weekly} />
      <p className="progress-note">A day with both strength and cardio counts in both bars, but once in the training-day total. First and last weeks may be partial for your selected dates.</p>
    </section>
    <div className="progress-overview-links"><button type="button" className="panel" onClick={() => onSelect('view', 'strength')}><h3>Strength progress →</h3><p>Reps at the same weight, records, weekly sets, and exercise history.</p></button><button type="button" className="panel" onClick={() => onSelect('view', 'cardio')}><h3>Cardio progress →</h3><p>Duration, distance, milestones, and speed with measurement coverage.</p></button></div>
  </div>
}

export default ProgressPage
