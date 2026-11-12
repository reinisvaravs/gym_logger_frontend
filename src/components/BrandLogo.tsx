import { Link } from 'react-router-dom'
import AppIcon from './AppIcon'

function BrandLogo({ to = '/history' }: { to?: string }) {
  return (
    <Link to={to} className="brand-logo" aria-label="Gym Logger home">
      <span className="brand-mark"><AppIcon name="training" className="h-6 w-6" /></span>
      <span>Gym<span className="brand-light">Logger</span><span className="brand-dot">.</span></span>
    </Link>
  )
}

export default BrandLogo
