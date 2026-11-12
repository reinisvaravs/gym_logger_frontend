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
        className="field"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}

export default ThemeSelect
