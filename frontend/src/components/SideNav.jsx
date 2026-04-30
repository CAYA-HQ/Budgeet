import { Link, useLocation } from 'react-router-dom'
import { Home, Receipt, Wallet, Lightbulb } from 'lucide-react'

function SideNav() {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/budget', label: 'Budget', icon: Wallet },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
  ]

  return (
    <div className="side-nav">
      <div className="side-nav-logo">
        <h2>Budgeet</h2>
      </div>
      <nav className="side-nav-links">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`side-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default SideNav
