import { useState, type FormEvent } from 'react'
import { register } from '../api/auth'

type RegisterFormProps = {
  onRegistered: (email: string) => void
  onLogin: () => void
}

function RegisterForm({ onRegistered, onLogin }: RegisterFormProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setError('')

    if (firstName.trim().length < 2 || firstName.trim().length > 100) {
      setError('Name must contain between 2 and 100 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      await register(firstName, email, password)
      onRegistered(email.trim())
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="register-heading">
      <p className="eyebrow">YOUR TRAINING STARTS HERE</p>
      <h2 id="register-heading" className="text-2xl font-semibold">Create an account</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A simple home for every session you put in.</p>

      <form onSubmit={handleSubmit} className="mt-6" aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className="space-y-5">
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium">Name</label>
            <input
              id="register-name"
              name="firstName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="field"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium">Email</label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="block text-sm font-medium">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
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
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <button type="button" onClick={onLogin} className="text-link w-full justify-center">
            Already have an account? Log in
          </button>
        </fieldset>
      </form>
    </section>
  )
}

export default RegisterForm
