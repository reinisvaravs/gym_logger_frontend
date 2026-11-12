import { useState } from 'react'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  function toggleTheme() {
    const nextIsDark = !isDark
    document.documentElement.classList.toggle('dark', nextIsDark)
    setIsDark(nextIsDark)

    try {
      localStorage.setItem('gym-theme', nextIsDark ? 'dark' : 'light')
    } catch {
      // The toggle still works for this visit without browser storage.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:outline-emerald-400"
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

export default ThemeToggle
