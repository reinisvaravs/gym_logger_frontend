import { apiUrl } from './config'

export async function register(firstName: string, email: string, password: string) {
  const response = await fetch(`${apiUrl}/users/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: firstName.trim(), email: email.trim(), password }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not create your account. Please try again.')
  }
}

export async function logout() {
  const response = await fetch(`${apiUrl}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not log out. Please try again.')
  }
}

export async function getCurrentUser(): Promise<string | null> {
  const response = await fetch(`${apiUrl}/me`, {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Could not check your session. Please try logging in.')
  }

  const data = await response.json()
  if (typeof data.userId !== 'string') {
    throw new Error('Could not check your session. Please try logging in.')
  }

  return data.userId
}

export async function login(email: string, password: string) {
  const response = await fetch(`${apiUrl}/users/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Could not log in. Please try again.')
  }

  const userId = await getCurrentUser()
  if (!userId) {
    throw new Error('Your session was not saved. Please try logging in again.')
  }

  return userId
}
