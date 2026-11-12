import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import CreateSessionForm from './CreateSessionForm'
import SessionDetails from './SessionDetails'

type SessionPageProps = {
  onSignedOut: () => void
}

export function NewSessionPage({ onSignedOut }: SessionPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const section = location.pathname.startsWith('/calendar') ? 'calendar' : 'history'
  const parentUrl = `/${section}${location.search}`
  const date = new URLSearchParams(location.search).get('date') || ''

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to={parentUrl} className="text-emerald-700 underline dark:text-emerald-400">{section === 'calendar' ? 'Calendar' : 'History'}</Link>
        <span aria-hidden="true">/</span><span aria-current="page">Log session</span>
      </nav>
      <CreateSessionForm
        hideBack
        initialDate={date}
        onSignedOut={onSignedOut}
        onBack={() => navigate(parentUrl)}
        onManageTypes={() => navigate('/training-types')}
        onSaved={(id) => navigate(`/${section}/sessions/${id}${location.search}`, { replace: true })}
      />
    </>
  )
}

export function SessionDetailPage({ onSignedOut }: SessionPageProps) {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const section = location.pathname.startsWith('/calendar') ? 'calendar' : 'history'
  const parentUrl = `/${section}${location.search}`

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to={parentUrl} className="text-emerald-700 underline dark:text-emerald-400">{section === 'calendar' ? 'Calendar' : 'History'}</Link>
        <span aria-hidden="true">/</span><span aria-current="page">Session details</span>
      </nav>
      <SessionDetails key={sessionId} hideBack sessionId={sessionId || ''} onSignedOut={onSignedOut} onBack={() => navigate(parentUrl, { replace: true })} />
    </>
  )
}
