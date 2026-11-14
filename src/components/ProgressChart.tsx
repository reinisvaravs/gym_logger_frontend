import { useId, useState, type PointerEvent } from 'react'
import ChartTooltip from './ChartTooltip'
import { Link, useLocation } from 'react-router-dom'
import { formatDisplayDate } from '../formatDate'
import { formatNumber } from '../formatStats'

type ChartPoint = { date: string; value: number | null; session_id?: string; details?: { label: string; value: string }[] }

type ProgressChartProps = {
  title: string
  unit: string
  points: ChartPoint[]
  context?: string
  weekly?: boolean
}

function ProgressChart({ title, unit, points, context, weekly }: ProgressChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const tooltipId = useId()
  const location = useLocation()
  if (!points.some((point) => point.value !== null)) {
    return <p className="progress-empty">No measurements to chart in this period.</p>
  }
  const width = 700, height = 230, left = 55, right = 20, top = 20, bottom = 42
  const dates = points.map((point) => Date.parse(point.date))
  const first = Math.min(...dates), last = Math.max(...dates)
  const values = points.flatMap((point) => point.value === null ? [] : [point.value])
  const lowest = Math.min(...values), highest = Math.max(...values)
  const padding = highest > lowest ? (highest - lowest) * 0.12 : Math.max(highest * 0.02, 0.1)
  const lower = Math.max(0, Math.floor(lowest - padding))
  const upper = Math.ceil(highest + padding)
  const roughStep = Math.max(1, (upper - lower) / 5)
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = ([1, 2, 5, 10].find((size) => size * magnitude >= roughStep) ?? 10) * magnitude
  const min = step >= 10 ? Math.floor(lower / step) * step : lower
  const max = min + Math.max(1, Math.ceil((upper - min) / step)) * step
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => min + index * step)
  const dateX = (date: number) => first === last ? width / 2 : left + (date - first) / (last - first) * (width - left - right)
  const x = (index: number) => dateX(dates[index])
  const y = (value: number) => top + (1 - (value - min) / (max - min)) * (height - top - bottom)
  // Missing measurements break the line instead of becoming zero.
  let path = '', connected = false
  points.forEach((point, index) => {
    if (point.value === null) { connected = false; return }
    path += `${connected ? 'L' : 'M'} ${x(index)} ${y(point.value)} `
    connected = true
  })
  // A trailing average uses only recorded values, never future entries.
  const recent: number[] = []
  const trend = points.map((point) => {
    if (point.value === null) return null
    recent.push(point.value)
    if (recent.length > 8) recent.shift()
    return recent.reduce((sum, value) => sum + value, 0) / recent.length
  })
  let trendPath = ''
  let previous: { x: number; y: number } | null = null
  trend.forEach((value, index) => {
    if (value === null) { previous = null; return }
    const next = { x: x(index), y: y(value) }
    if (previous) {
      const middle = (previous.x + next.x) / 2
      trendPath += `C ${middle} ${previous.y}, ${middle} ${next.y}, ${next.x} ${next.y} `
    } else {
      trendPath += `M ${next.x} ${next.y} `
    }
    previous = next
  })
  const selected = active === null ? null : points[active]
  const selectedTrend = active === null ? null : trend[active]
  const labelCount = Math.min(7, Math.round((last - first) / 86400000) + 1)
  const labels = Array.from({ length: labelCount }, (_, index) => {
    const time = labelCount === 1 ? first : first + (last - first) * index / (labelCount - 1)
    return Math.round(time / 86400000) * 86400000
  })

  function showNearest(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = (event.clientX - rect.left) / rect.width * width
    const pointerY = (event.clientY - rect.top) / rect.height * height
    let nearest = 0
    points.forEach((point, index) => {
      const distance = Math.abs(x(index) - pointerX)
      const bestDistance = Math.abs(x(nearest) - pointerX)
      if (distance < bestDistance || (distance === bestDistance && Math.abs(y(point.value ?? 0) - pointerY) < Math.abs(y(points[nearest].value ?? 0) - pointerY))) nearest = index
    })
    setActive(nearest)
  }

  return (
    <div className="progress-chart" onKeyDown={(event) => { if (event.key === 'Escape') setActive(null) }}>
      <div className="chart-legend" aria-label="Chart lines"><span><i className="chart-legend-recorded" />Recorded values</span><span><i className="chart-legend-trend" />Smooth trend · up to 8-entry average</span></div>
      {selected && <ChartTooltip id={tooltipId} date={selected.date} label={title} value={selected.value === null ? 'Not recorded' : `${formatNumber(selected.value)} ${unit}`} context={context} weekly={weekly} left={x(active!) / width * 100} details={[...(selected.details || []), { label: 'Smoothed trend', value: selectedTrend == null ? 'Not recorded' : `${formatNumber(selectedTrend)} ${unit}` }]} /> }
      <svg onPointerMove={showNearest} onPointerDown={showNearest} onPointerLeave={(event) => { if (event.pointerType !== 'touch' && !event.currentTarget.contains(document.activeElement)) setActive(null) }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null) }} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`${title}. ${unit}. Recorded values and a smoothed trailing 8-entry average. Hover anywhere or focus a point for details. Press Escape to dismiss.`}>
        {ticks.map((value) => <g key={value}>
          <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} className="chart-grid" />
          <text x={left - 10} y={y(value) + 4} textAnchor="end">{formatNumber(value)}</text>
        </g>)}
        {selected && active !== null && <line x1={x(active)} x2={x(active)} y1={top} y2={height - bottom} className="chart-guide" />}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
        <path d={trendPath} fill="none" className="chart-trend-line" strokeWidth="3" strokeLinecap="round" />
        {points.map((point, index) => point.value === null ? null : (
          point.session_id ? <Link key={`${point.date}-${index}`} to={`/progress/sessions/${point.session_id}${location.search}`} onFocus={() => setActive(index)} aria-describedby={active === index ? tooltipId : undefined} aria-label={`${formatDisplayDate(point.date)}: ${formatNumber(point.value)} ${unit}. Open session.`}>
            <circle cx={x(index)} cy={y(point.value)} r={active === index ? 7 : 5} className="chart-point" />
          </Link> : <circle key={point.date} cx={x(index)} cy={y(point.value)} r={active === index ? 7 : 4} className="chart-point" tabIndex={0} onFocus={() => setActive(index)} aria-describedby={active === index ? tooltipId : undefined} role="img" aria-label={`${formatDisplayDate(point.date)}: ${formatNumber(point.value)} ${unit}`} />
        ))}
        {labels.map((date, index) => <text key={date} className={index % 2 === 1 && index !== labels.length - 1 ? 'chart-date-extra' : undefined} x={dateX(date)} y={height - 12} textAnchor={index === 0 && labels.length > 1 ? 'start' : index === labels.length - 1 && labels.length > 1 ? 'end' : 'middle'}>{formatDisplayDate(new Date(date).toISOString().slice(0, 10))}</text>)}
      </svg>
      <p className="chart-scale-note">Vertical axis fits the recorded range.</p>
    </div>
  )
}

export default ProgressChart
