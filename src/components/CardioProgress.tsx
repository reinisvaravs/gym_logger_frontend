import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { CardioStatistics } from '../api/statistics'
import { useUnits } from '../UnitsContext'
import { displayDistance, displaySpeed } from '../units'
import { formatDisplayDate } from '../formatDate'
import { formatNumber, formatStatsDuration } from '../formatStats'
import ProgressChart from './ProgressChart'
import ProgressMetric from './ProgressMetric'

function CardioProgress({ activity }: { activity: CardioStatistics }) {
  const { unitSystem } = useUnits()
  const location = useLocation()
  const [measurement, setMeasurement] = useState<'duration' | 'distance'>('duration')
  const unit = unitSystem === 'imperial' ? 'mi' : 'km'
  const speedUnit = unitSystem === 'imperial' ? 'mph' : 'km/h'
  const distance = (value: number | null) => value === null ? '—' : `${formatNumber(displayDistance(value, unitSystem))} ${unit}`
  const speed = (value: number | null) => value === null ? '—' : `${formatNumber(displaySpeed(value, unitSystem))} ${speedUnit}`
  const link = (id: string) => `/progress/sessions/${id}${location.search}`
  const summary = activity.summary

  return <div className="progress-stack">
    <div className="progress-metrics">
      <ProgressMetric label="Recorded duration" value={formatStatsDuration(summary.duration_seconds)} detail={`${activity.history.length} activity sessions`} />
      <ProgressMetric label="Recorded distance" value={distance(summary.distance_km)} detail={`Distance recorded for ${summary.distance_sets} of ${summary.set_count} sets`} />
      <ProgressMetric label="Average speed" value={speed(summary.average_speed_kmh)} detail="Total eligible distance ÷ logged duration" />
      <ProgressMetric label="Average heart rate" value={summary.average_heart_rate_bpm === null ? '—' : `${formatNumber(summary.average_heart_rate_bpm)} bpm`} detail={`Duration-weighted; ${summary.heart_rate_sets} of ${summary.set_count} sets`} />
    </div>
    <section className="panel"><div className="progress-panel-heading"><div><h3>Weekly activity</h3><p>Latest 12 weeks within the selected period. Indoor and outdoor activities stay separate.</p></div>
      <label className="progress-select">Measurement<select className="field" value={measurement} onChange={(event) => setMeasurement(event.target.value as typeof measurement)}><option value="duration">Duration</option><option value="distance">Distance</option></select></label>
    </div>
      <ProgressChart title={`Weekly ${measurement}`} unit={measurement === 'duration' ? 'hours' : unit} points={activity.weekly.map((week) => ({ date: week.week, value: measurement === 'duration' ? week.duration_seconds / 3600 : week.distance_km === null ? null : displayDistance(week.distance_km, unitSystem) }))} />
      <p className="progress-note">The current week may be incomplete. Missing distance is unknown, not zero. Recorded distance may cover only part of a week.</p>
    </section>
    <div className="progress-metrics">
      <ProgressMetric label="Longest duration in this period" value={activity.longest_duration ? <Link to={link(activity.longest_duration.id)}>{formatStatsDuration(activity.longest_duration.duration_seconds)}</Link> : '—'} detail={activity.longest_duration ? formatDisplayDate(activity.longest_duration.date) : undefined} />
      <ProgressMetric label="Longest recorded distance" value={activity.longest_distance ? <Link to={link(activity.longest_distance.id)}>{distance(activity.longest_distance.distance_km)}</Link> : '—'} detail={activity.longest_distance ? formatDisplayDate(activity.longest_distance.date) : undefined} />
    </div>
    <section className="panel"><div className="progress-panel-heading"><div><h3>Activity history</h3><p>Speed uses your logged duration, not GPS moving time. Routes, terrain, and conditions affect comparisons.</p></div></div>
      <div className="progress-table-wrap"><table className="progress-table cardio-table"><thead><tr><th>Date</th><th>Duration</th><th>Distance</th><th>Avg. speed</th><th>Avg. heart rate</th></tr></thead><tbody>
        {[...activity.history].reverse().map((session) => <tr key={session.id}><td><Link to={link(session.id)} className="text-link">{formatDisplayDate(session.date)}</Link></td><td>{formatStatsDuration(session.duration_seconds)}</td><td>{distance(session.distance_km)}</td><td>{speed(session.average_speed_kmh)}</td><td>{session.average_heart_rate_bpm === null ? '—' : `${formatNumber(session.average_heart_rate_bpm)} bpm`}</td></tr>)}
      </tbody></table></div>
      <p className="progress-note sm:hidden">Scroll the table sideways for all measurements.</p>
      <p className="progress-note">A dash means no measurement was recorded. Average speed excludes sets missing distance or duration; heart rate excludes missing readings.</p>
    </section>
  </div>
}

export default CardioProgress
