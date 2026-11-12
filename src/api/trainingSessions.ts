import { apiUrl } from './config'

export type TrainingSession = {
  id: string
  user_id: string
  training_type_id: string
  performed_on: string
  session_order: number
  notes: string | null
  created_at: string
  training_name: string
  category: 'weighted_reps' | 'bodyweight_reps' | 'cardio'
}

export type TrainingSet = {
  id: string
  session_id: string
  set_order: number
  reps: string | null
  weight_kg: string | null
  duration_seconds: number | null
  distance_km: string | null
  avg_heart_rate_bpm: number | null
  avg_power_watts: string | null
  avg_cadence: string | null
  elevation_gain_m: string | null
  created_at: string
}

export type TrainingSessionDetails = TrainingSession & {
  sets: TrainingSet[]
}

export type TrainingSessionUpdate = {
  performed_on: string
  session_order: number
  notes: string | null
}

export async function updateTrainingSession(
  id: string,
  performedOn: string,
  sessionOrder: number,
  notes: string,
): Promise<TrainingSessionUpdate | null> {
  const response = await fetch(`${apiUrl}/training-sessions/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ performedOn, sessionOrder, notes: notes.trim() || null }),
  })
  if (response.status === 401) return null
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not update this training session.')
  }
  return response.json()
}

export async function getTrainingSession(id: string): Promise<TrainingSessionDetails | null> {
  const response = await fetch(`${apiUrl}/training-sessions/${id}`, {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }
  if (response.status === 404) {
    throw new Error('This training session could not be found.')
  }
  if (!response.ok) {
    throw new Error('Could not load this training session. Please try again.')
  }

  return response.json()
}

export async function getTrainingSessions(from?: string, to?: string): Promise<TrainingSession[] | null> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const response = await fetch(`${apiUrl}/training-sessions?${params}`, {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Could not load your training history. Please try again.')
  }

  return response.json()
}

export type TrainingSetInput = {
  reps: number | null
  weightKg: number | null
  durationSeconds: number | null
  distanceKm: number | null
  avgHeartRateBpm: number | null
  avgPowerWatts: number | null
  avgCadence: number | null
  elevationGainM: number | null
}

type TrainingSessionInput = {
  trainingTypeId: string
  performedOn: string
  sessionOrder: number
  notes: string
  sets: TrainingSetInput[]
}

export async function createTrainingSession(input: TrainingSessionInput): Promise<{ id: string } | null> {
  const response = await fetch(`${apiUrl}/training-sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (response.status === 401) return null
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not save this training session.')
  }
  return response.json()
}
