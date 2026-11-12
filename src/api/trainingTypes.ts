import { apiUrl } from './config'

export type TrainingCategory = 'weighted_reps' | 'bodyweight_reps' | 'cardio'

export type TrainingType = {
  id: string
  user_id: string
  training_name: string
  category: TrainingCategory
  created_at: string
  archived_at: string | null
}

export async function getTrainingTypes(): Promise<TrainingType[] | null> {
  const response = await fetch(`${apiUrl}/training-types`, { credentials: 'include' })
  if (response.status === 401) return null
  if (!response.ok) throw new Error('Could not load your training library.')
  return response.json()
}

async function readTrainingTypeResponse(response: Response): Promise<TrainingType | null> {
  if (response.status === 401) return null
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not save this training type.')
  }
  return response.json()
}

export async function createTrainingType(trainingName: string, category: TrainingCategory) {
  const response = await fetch(`${apiUrl}/training-types`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainingName: trainingName.trim(), category }),
  })
  return readTrainingTypeResponse(response)
}

export async function renameTrainingType(id: string, trainingName: string) {
  const response = await fetch(`${apiUrl}/training-types/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainingName: trainingName.trim() }),
  })
  return readTrainingTypeResponse(response)
}

export async function setTrainingTypeArchived(id: string, archived: boolean) {
  const action = archived ? 'archive' : 'unarchive'
  const response = await fetch(`${apiUrl}/training-types/${id}/${action}`, {
    method: 'PATCH',
    credentials: 'include',
  })
  return readTrainingTypeResponse(response)
}

export async function deleteTrainingType(id: string) {
  const response = await fetch(`${apiUrl}/training-types/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (response.status === 401) return false
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not delete this training type.')
  }
  return true
}
