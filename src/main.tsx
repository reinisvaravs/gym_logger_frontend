import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

try {
  const savedTheme = localStorage.getItem('gym-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme
} catch {
  // The system theme still works if browser storage is unavailable.
}

document.documentElement.classList.toggle('dark', theme === 'dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
