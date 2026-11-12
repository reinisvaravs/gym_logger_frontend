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

export async function getTrainingSessions(): Promise<TrainingSession[] | null> {
  const response = await fetch(`${apiUrl}/training-sessions`, {
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
