export function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  const isCurrentYear = date.getFullYear() === new Date().getFullYear()

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: isCurrentYear ? undefined : 'numeric',
  })
}
