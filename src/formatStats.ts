export function formatNumber(value: number) {
  return value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
}

export function formatStatsDuration(seconds: number) {
  return seconds >= 3600 ? `${formatNumber(seconds / 3600)} h` : `${formatNumber(seconds / 60)} min`
}
