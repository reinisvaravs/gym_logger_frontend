import type { ReactNode } from 'react'

function ProgressMetric({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return <div className="panel progress-metric"><p>{label}</p><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
}

export default ProgressMetric
