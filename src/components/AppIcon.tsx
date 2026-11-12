type AppIconProps = {
  name: 'history' | 'calendar' | 'library' | 'settings' | 'training' | 'plus' | 'arrow' | 'logout' | 'search' | 'chevron' | 'activity'
  className?: string
}

function AppIcon({ name, className = 'h-5 w-5' }: AppIconProps) {
  const paths = {
    history: <><path d="M4 5h16v15H4zM8 2v5M16 2v5M4 10h16M8 14h3M8 17h7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18M8 15h1M15 15h1M8 18h1" /></>,
    library: <><path d="M4 4h6v16H4zM10 4h5v16h-5M16 5l4-1 3 15-4 1zM6 8h2M12 8h1" /></>,
    settings: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" /><circle cx="15" cy="17" r="3" /></>,
    training: <><path d="M3 8v8M7 5v14M7 12h10M17 5v14M21 8v8" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    logout: <><path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>
}

export default AppIcon
