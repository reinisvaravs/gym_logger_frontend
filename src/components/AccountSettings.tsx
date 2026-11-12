import TrashIcon from './TrashIcon'
import { useState, type FormEvent } from 'react'
import { changePassword, deleteAccount } from '../api/auth'
import UnitsSelect from './UnitsSelect'
import ThemeSelect from './ThemeSelect'

type AccountSettingsProps = {
  hideBack?: boolean
  onBack: () => void
  onSignedOut: (message?: string, success?: boolean) => void
}

function AccountSettings({ onBack, onSignedOut, hideBack = false }: AccountSettingsProps) {
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
  const inputClass = 'field'

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
    <section className="settings-page" aria-labelledby="settings-heading">
      {!hideBack && <button type="button" disabled={isBusy} onClick={onBack} className="btn btn-secondary mb-6">Back to history</button>}
      <header className="page-heading"><p className="eyebrow">PERSONAL SETTINGS</p><h2 id="settings-heading">Account settings</h2><p className="page-subtitle">Your preferences, security, and account. All in one place.</p></header>

      <section aria-labelledby="preferences-heading" className="panel mt-6">
        <h3 id="preferences-heading" className="text-lg font-semibold">Preferences</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Changes are saved automatically in this browser.</p>
        <fieldset disabled={isBusy} className="mt-5 grid gap-4 sm:grid-cols-2">
          <UnitsSelect />
          <ThemeSelect />
        </fieldset>
      </section>

      <form onSubmit={handleSubmit} className="panel mt-6" aria-busy={isSaving}>
        <h3 className="text-lg font-semibold">Change password</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">You’ll stay logged in here. Other devices will need to log in again.</p>
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

          {error && <p role="alert" className="notice notice-error">{error}</p>}
          {successMessage && <p role="status" className="notice notice-success mb-4">{successMessage}</p>}

          <button type="submit" className="btn btn-primary">{isSaving ? 'Changing password…' : 'Change password'}</button>
        </fieldset>
      </form>

      <form onSubmit={handleDelete} className="panel panel-danger mt-6" aria-busy={isDeleting}>
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Delete account</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Permanently delete your account, training library, sessions, and sets. This cannot be undone.</p>
        <fieldset disabled={isBusy} className="mt-5 space-y-4">
          <div>
            <label htmlFor="delete-account-password" className="block text-sm font-medium">Current password</label>
            <input id="delete-account-password" name="currentPassword" type="password" autoComplete="current-password" required minLength={4} maxLength={255} value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className={inputClass} />
          </div>
          {deleteError && <p role="alert" className="notice notice-error">{deleteError}</p>}
          <button type="submit" className="icon-button" aria-label={isDeleting ? "Deleting account" : "Delete my account"} title="Delete my account" aria-busy={isDeleting}><TrashIcon /></button>
        </fieldset>
      </form>
    </section>
  )
}

export default AccountSettings
