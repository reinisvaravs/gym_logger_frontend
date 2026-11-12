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
