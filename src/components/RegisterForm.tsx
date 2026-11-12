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
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="register-heading">
      <h2 id="register-heading" className="text-2xl font-semibold">Create an account</h2>
      <p className="mt-2 text-sm text-slate-600">Start keeping track of your training.</p>

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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100"
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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100"
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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-slate-100"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>

          <button type="button" onClick={onLogin} className="w-full cursor-pointer text-sm font-medium text-emerald-700 underline disabled:cursor-wait disabled:opacity-60">
            Already have an account? Log in
          </button>
        </fieldset>
      </form>
    </section>
  )
}

export default RegisterForm
