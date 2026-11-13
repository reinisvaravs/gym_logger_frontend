import { useId, useState } from 'react'
import { formatDisplayDate } from '../formatDate'
import ChartTooltip from './ChartTooltip'

type Week = { week: string; strength_days: number; cardio_days: number }

function WeeklyActivityChart({ weeks }: { weeks: Week[] }) {
  const [active, setActive] = useState<{ index: number; left: number } | null>(null)
  const id = useId()
  const week = active ? weeks[active.index] : null

  function showWeek(element: HTMLElement, index: number) {
    const rect = element.getBoundingClientRect()
    const parent = element.closest('.weekly-chart-container')!.getBoundingClientRect()
    setActive({ index, left: (rect.left + rect.width / 2 - parent.left) / parent.width * 100 })
  }

  return <div className="weekly-chart-container" onKeyDown={(event) => { if (event.key === 'Escape') setActive(null) }} onPointerLeave={(event) => { if (event.pointerType !== 'touch' && !event.currentTarget.contains(document.activeElement)) setActive(null) }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null) }}>
    {week && active && <ChartTooltip id={id} date={week.week} label="Training days" weekly left={active.left} details={[{ label: 'Strength', value: `${week.strength_days} days` }, { label: 'Cardio', value: `${week.cardio_days} days` }]} />}
    <div className="activity-chart" role="group" aria-label="Weekly strength and cardio training days" onScroll={() => setActive(null)}>
      {weeks.map((entry, index) => <div key={entry.week} className="activity-week" tabIndex={0} role="img" aria-label={`Week of ${formatDisplayDate(entry.week)}: ${entry.strength_days} strength days, ${entry.cardio_days} cardio days`} aria-describedby={active?.index === index ? id : undefined} onPointerEnter={(event) => showWeek(event.currentTarget, index)} onPointerDown={(event) => showWeek(event.currentTarget, index)} onFocus={(event) => showWeek(event.currentTarget, index)} onClick={(event) => event.currentTarget.focus()}>
        <div className="activity-bars">
          <div className="activity-bar strength-key" style={{ height: `${entry.strength_days / 7 * 100}%` }}><span>{entry.strength_days || ''}</span></div>
          <div className="activity-bar cardio-key" style={{ height: `${entry.cardio_days / 7 * 100}%` }}><span>{entry.cardio_days || ''}</span></div>
        </div><small>{formatDisplayDate(entry.week)}</small>
      </div>)}
    </div>
  </div>
}

export default WeeklyActivityChart
