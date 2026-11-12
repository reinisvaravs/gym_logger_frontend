import { useState } from 'react'

function ThemeSelect() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  function changeTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)

    try {
      localStorage.setItem('gym-theme', dark ? 'dark' : 'light')
    } catch {
      // The selection still works for this visit without browser storage.
    }
  }

  return (
    <div>
      <label htmlFor="theme" className="block text-sm font-medium">Theme</label>
      <select
        id="theme"
        value={isDark ? 'dark' : 'light'}
        onChange={(event) => changeTheme(event.target.value === 'dark')}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 focus:outline-emerald-700 dark:focus:outline-emerald-400"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}

export default ThemeSelect
