import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { StrengthStatistics } from '../api/statistics'
import { useUnits } from '../UnitsContext'
import { displayWeight } from '../units'
import { formatDisplayDate } from '../formatDate'
import { formatNumber } from '../formatStats'
import ProgressChart from './ProgressChart'
import ProgressMetric from './ProgressMetric'

type StrengthProgressProps = {
  exercise: StrengthStatistics
  weight: string | null
  onWeightChange: (weight: string) => void
}

function StrengthProgress({ exercise, weight, onWeightChange }: StrengthProgressProps) {
  const { unitSystem } = useUnits()
  const location = useLocation()
  const [weeklyMetric, setWeeklyMetric] = useState<'sets' | 'reps' | 'volume'>('sets')
  const unit = unitSystem === 'imperial' ? 'lb' : 'kg'
  const isBodyweight = exercise.category === 'bodyweight_reps'
  const record = exercise.records.find((row) => String(row.weight_kg) === weight) || exercise.records[0]
  const heaviest = exercise.records.filter((row) => row.weight_kg !== null).at(-1)
  const bodyweightBest = exercise.records.find((row) => row.weight_kg === null)
  const link = (id: string) => `/progress/sessions/${id}${location.search}`
  const weightLabel = (value: number | null) => value === null || (isBodyweight && value === 0)
    ? isBodyweight ? 'Bodyweight' : 'Weight unknown'
    : `${isBodyweight ? '+' : ''}${formatNumber(displayWeight(value, unitSystem))} ${unit}`

  return <div className="progress-stack">
    <div className="progress-metrics">
      <ProgressMetric label="Exercise sessions" value={exercise.history.length} detail="In the selected period" />
      <ProgressMetric label="Recorded sets" value={exercise.history.reduce((sum, session) => sum + session.sets.length, 0)} />
      <ProgressMetric label={isBodyweight ? 'Best bodyweight set' : 'Heaviest recorded set'} value={isBodyweight && bodyweightBest ? <Link to={link(bodyweightBest.session_id)}>{formatNumber(bodyweightBest.reps)} reps</Link> : heaviest ? <Link to={link(heaviest.session_id)}>{weightLabel(heaviest.weight_kg)} × {formatNumber(heaviest.reps)}</Link> : '—'} detail="Record within this period" />
    </div>

    <section className="panel">
      <div className="progress-panel-heading"><div><h3>Reps at the same weight</h3><p>Best set on each training day. Select a point to open the session.</p></div>
        <label className="progress-select">{isBodyweight ? 'Added weight' : 'Weight'}<select className="field" value={record ? String(record.weight_kg) : ''} onChange={(event) => onWeightChange(event.target.value)} disabled={!record}>
          {exercise.records.map((row) => <option key={String(row.weight_kg)} value={String(row.weight_kg)}>{weightLabel(row.weight_kg)}</option>)}
        </select></label>
      </div>
      <ProgressChart title="Best reps at selected weight" unit="reps" points={record?.progress || []} />
    </section>

    <section className="panel"><div className="progress-panel-heading"><div><h3>Records by weight</h3><p>Highest recorded reps at each weight in this period. Ties show the first achievement.</p></div></div>
      <div className="progress-table-wrap"><table className="progress-table"><thead><tr><th>{isBodyweight ? 'Added weight' : 'Weight'}</th><th>Best reps</th><th>Date</th></tr></thead><tbody>
        {exercise.records.map((row) => <tr key={String(row.weight_kg)}><td>{weightLabel(row.weight_kg)}</td><td>{formatNumber(row.reps)}</td><td><Link to={link(row.session_id)} className="text-link">{formatDisplayDate(row.date)}</Link></td></tr>)}
      </tbody></table></div>
    </section>

    <section className="panel"><div className="progress-panel-heading"><div><h3>Weekly training volume</h3><p>Latest 12 weeks within the selected period, including zero weeks.</p></div>
      <label className="progress-select">Measurement<select className="field" value={weeklyMetric} onChange={(event) => setWeeklyMetric(event.target.value as typeof weeklyMetric)}>
        <option value="sets">Sets</option><option value="reps">Reps</option>{!isBodyweight && <option value="volume">Recorded load × reps</option>}
      </select></label></div>
      <ProgressChart title="Weekly training volume" unit={weeklyMetric === 'volume' ? `${unit} × reps` : weeklyMetric} points={exercise.weekly.map((week) => ({ date: week.week, value: weeklyMetric === 'volume' ? displayWeight(week.volume, unitSystem) : week[weeklyMetric] }))} />
      <p className="progress-note">The current week may be incomplete. {weeklyMetric === 'volume' ? 'Volume describes recorded work, not strength. Dumbbell loads retain the per-dumbbell convention.' : 'Sets and reps describe training amount, not performance on their own.'}</p>
    </section>

    <section className="panel"><div className="progress-panel-heading"><div><h3>Exercise history</h3><p>Actual sets, newest first.</p></div></div>
      <div className="progress-table-wrap"><table className="progress-table"><thead><tr><th>Date</th><th>Sets</th></tr></thead><tbody>
        {[...exercise.history].reverse().map((session) => <tr key={session.id}><td><Link to={link(session.id)} className="text-link">{formatDisplayDate(session.date)}</Link></td><td>{session.sets.map((set) => `${weightLabel(set.weight_kg)} × ${set.reps === null ? '—' : formatNumber(set.reps)}`).join(' · ')}</td></tr>)}
      </tbody></table></div>
    </section>
  </div>
}

export default StrengthProgress
