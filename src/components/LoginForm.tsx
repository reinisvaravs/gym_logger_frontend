import { useState, type FormEvent } from 'react'
import { login } from '../api/auth'

type LoginFormProps = {
  onLogin: (userId: string) => void
  onRegister: () => void
  initialEmail?: string
}

function LoginForm({ onLogin, onRegister, initialEmail = '' }: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      const userId = await login(email, password)
      onLogin(userId)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not log in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="login-heading">
      <p className="eyebrow">BACK TO YOUR TRAINING</p>
      <h2 id="login-heading" className="text-2xl font-semibold">Welcome back.</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Log in to your personal training space.</p>

      <form onSubmit={handleSubmit} className="mt-6" aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={4}
              maxLength={255}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
            />
          </div>

          {error && <p role="alert" className="notice notice-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>

          <button type="button" onClick={onRegister} className="text-link w-full justify-center">
            Create an account
          </button>
        </fieldset>
      </form>
    </section>
  )
}

export default LoginForm
