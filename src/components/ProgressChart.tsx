import { Link, useLocation } from 'react-router-dom'
import { formatDisplayDate } from '../formatDate'
import { formatNumber } from '../formatStats'

type ChartPoint = { date: string; value: number | null; session_id?: string }

type ProgressChartProps = {
  title: string
  unit: string
  points: ChartPoint[]
}

function ProgressChart({ title, unit, points }: ProgressChartProps) {
  const location = useLocation()
  if (!points.some((point) => point.value !== null)) {
    return <p className="progress-empty">No measurements to chart in this period.</p>
  }
  const width = 700, height = 230, left = 55, right = 20, top = 20, bottom = 42
  const dates = points.map((point) => Date.parse(point.date))
  const first = Math.min(...dates), last = Math.max(...dates)
  const max = Math.max(1, ...points.map((point) => point.value ?? 0))
  const x = (index: number) => first === last ? width / 2 : left + (dates[index] - first) / (last - first) * (width - left - right)
  const y = (value: number) => top + (1 - value / max) * (height - top - bottom)
  // Missing measurements break the line instead of becoming zero.
  let path = '', connected = false
  points.forEach((point, index) => {
    if (point.value === null) { connected = false; return }
    path += `${connected ? 'L' : 'M'} ${x(index)} ${y(point.value)} `
    connected = true
  })
  const labels = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])]

  return (
    <div className="progress-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`${title}. ${unit}. Hover or focus a point for its value.`}>
        {[0, max / 2, max].map((value) => <g key={value}>
          <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} className="chart-grid" />
          <text x={left - 10} y={y(value) + 4} textAnchor="end">{formatNumber(value)}</text>
        </g>)}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {points.map((point, index) => point.value === null ? null : (
          point.session_id ? <Link key={`${point.date}-${index}`} to={`/progress/sessions/${point.session_id}${location.search}`} aria-label={`${formatDisplayDate(point.date)}: ${formatNumber(point.value)} ${unit}. Open session.`}>
            <circle cx={x(index)} cy={y(point.value)} r="5" className="chart-point"><title>{formatDisplayDate(point.date)}: {formatNumber(point.value)} {unit}</title></circle>
          </Link> : <circle key={point.date} cx={x(index)} cy={y(point.value)} r="4" className="chart-point" tabIndex={0} role="img" aria-label={`${formatDisplayDate(point.date)}: ${formatNumber(point.value)} ${unit}`}><title>{formatDisplayDate(point.date)}: {formatNumber(point.value)} {unit}</title></circle>
        ))}
        {labels.map((index) => <text key={index} x={x(index)} y={height - 12} textAnchor={index === 0 && points.length > 1 ? 'start' : index === points.length - 1 && points.length > 1 ? 'end' : 'middle'}>{formatDisplayDate(points[index].date)}</text>)}
      </svg>
    </div>
  )
}

export default ProgressChart
