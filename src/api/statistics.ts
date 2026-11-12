import { apiUrl } from './config'

type SetMeasurements = {
  id: string
  reps: number | null
  weight_kg: number | null
  duration_seconds: number | null
  distance_km: number | null
  avg_heart_rate_bpm: number | null
}

export type CardioTotals = {
  duration_seconds: number
  distance_km: number | null
  average_speed_kmh: number | null
  average_heart_rate_bpm: number | null
  set_count: number
  distance_sets: number
  heart_rate_sets: number
}

export type StrengthStatistics = {
  id: string
  name: string
  category: string
  archived: boolean
  history: { id: string; date: string; sets: SetMeasurements[] }[]
  records: { weight_kg: number | null; reps: number; date: string; session_id: string;
    progress: { date: string; value: number; session_id: string }[] }[]
  weekly: { week: string; sets: number; reps: number; volume: number }[]
}

export type CardioStatistics = {
  id: string
  name: string
  archived: boolean
  summary: CardioTotals
  history: (CardioTotals & { id: string; date: string })[]
  longest_duration: (CardioTotals & { id: string; date: string }) | null
  longest_distance: (CardioTotals & { id: string; date: string }) | null
  weekly: (CardioTotals & { week: string })[]
}

export type Statistics = {
  from: string | null
  to: string
  overview: { training_days: number; strength_sets: number; cardio: CardioTotals }
  weekly: { week: string; strength_days: number; cardio_days: number }[]
  strength: StrengthStatistics[]
  cardio: CardioStatistics[]
}

export async function getStatistics(from: string, to: string): Promise<Statistics | null> {
  const params = new URLSearchParams({ to })
  if (from) params.set('from', from)
  const response = await fetch(`${apiUrl}/statistics?${params}`, { credentials: 'include' })
  if (response.status === 401) return null
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not load your training progress.')
  }
  return response.json()
}
