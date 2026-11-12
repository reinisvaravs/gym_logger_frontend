import { useState, type FormEvent } from 'react'
import { changePassword, deleteAccount } from '../api/auth'

type AccountSettingsProps = {
  onBack: () => void
  onSignedOut: (message?: string, success?: boolean) => void
}

function AccountSettings({ onBack, onSignedOut }: AccountSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const isBusy = isSaving || isDeleting
  const inputClass = 'mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-emerald-700'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isBusy) return
    setError('')
    setSuccessMessage('')
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.')
      return
    }

    setIsSaving(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      if (result.requiresLogin) return onSignedOut(result.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccessMessage(result.message)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not change your password.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isBusy) return
    if (!window.confirm('Permanently delete your account and all training data? This cannot be undone.')) return

    setDeleteError('')
    setSuccessMessage('')
    setIsDeleting(true)
    try {
      const result = await deleteAccount(deletePassword)
      onSignedOut(result.message, result.isDeleted)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete your account.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section aria-labelledby="settings-heading">
      <button type="button" disabled={isBusy} onClick={onBack} className="mb-6 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-60">Back to history</button>
      <h2 id="settings-heading" className="text-2xl font-semibold">Account settings</h2>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-busy={isSaving}>
        <h3 className="text-lg font-semibold">Change password</h3>
        <p className="mt-2 text-sm text-slate-600">You’ll stay logged in here. Other devices will need to log in again.</p>
        <fieldset disabled={isBusy} className="mt-5 space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium">Current password</label>
            <input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required minLength={4} maxLength={255} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium">New password</label>
            <input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={4} maxLength={255} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm new password</label>
            <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={4} maxLength={255} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {successMessage && <p role="status" className="text-sm text-emerald-800">{successMessage}</p>}

          <button type="submit" className="cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60">{isSaving ? 'Changing password…' : 'Change password'}</button>
        </fieldset>
      </form>

      <form onSubmit={handleDelete} className="mt-6 rounded-xl border border-red-200 bg-white p-5" aria-busy={isDeleting}>
        <h3 className="text-lg font-semibold text-red-700">Delete account</h3>
        <p className="mt-2 text-sm text-slate-600">Permanently delete your account, training library, sessions, and sets. This cannot be undone.</p>
        <fieldset disabled={isBusy} className="mt-5 space-y-4">
          <div>
            <label htmlFor="delete-account-password" className="block text-sm font-medium">Current password</label>
            <input id="delete-account-password" name="currentPassword" type="password" autoComplete="current-password" required minLength={4} maxLength={255} value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className={inputClass} />
          </div>
          {deleteError && <p role="alert" className="text-sm text-red-700">{deleteError}</p>}
          <button type="submit" className="cursor-pointer rounded-lg bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 disabled:opacity-60">{isDeleting ? 'Deleting account…' : 'Delete my account'}</button>
        </fieldset>
      </form>
    </section>
  )
}

export default AccountSettings
