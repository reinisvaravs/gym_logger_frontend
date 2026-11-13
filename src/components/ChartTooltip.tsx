import { formatDisplayDate } from '../formatDate'

type ChartTooltipProps = {
  id: string
  date: string
  label: string
  value?: string
  context?: string
  weekly?: boolean
  left: number
  details?: { label: string; value: string }[]
}

function ChartTooltip({ id, date, label, value, context, weekly, left, details = [] }: ChartTooltipProps) {
  return <div id={id} role="tooltip" className="chart-tooltip" style={{ left: `clamp(0px, ${left}%, max(0px, calc(100% - 240px)))` }}>
    <p className="chart-tooltip-date">{weekly ? 'Week of ' : ''}{formatDisplayDate(date)}</p>
    {context && <p className="chart-tooltip-context">{context}</p>}
    <p className="chart-tooltip-value"><span>{label}</span>{value && <strong>{value}</strong>}</p>
    {details.length > 0 && <dl>{details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>}
  </div>
}

export default ChartTooltip
