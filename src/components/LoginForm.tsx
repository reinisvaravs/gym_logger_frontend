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
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="login-heading">
      <h2 id="login-heading" className="text-2xl font-semibold">Log in</h2>
      <p className="mt-2 text-sm text-slate-600">Sign in to view your training.</p>

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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100"
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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>

          <button type="button" onClick={onRegister} className="w-full cursor-pointer text-sm font-medium text-emerald-700 underline disabled:cursor-wait disabled:opacity-60">
            Create an account
          </button>
        </fieldset>
      </form>
    </section>
  )
}

export default LoginForm
