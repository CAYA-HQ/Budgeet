import { Link, useLocation } from 'react-router-dom'
import { Home, Lightbulb } from 'lucide-react'
import FABMenu from './FABMenu'

function BottomNav({ onAddExpense, onAddIncome }) {
  const location = useLocation()

  return (
    <div className="bottom-nav">
      <Link
        to="/dashboard"
        className={`bottom-nav-item ${location.pathname === '/dashboard' || location.pathname === '/demo' ? 'active' : ''}`}
      >
        <Home size={24} />
        <span>Home</span>
      </Link>

      <FABMenu
        onAddExpense={onAddExpense}
        onAddIncome={onAddIncome}
      />

      <Link
        to="/insights"
        className={`bottom-nav-item ${location.pathname === '/insights' ? 'active' : ''}`}
      >
        <Lightbulb size={24} />
        <span>Insights</span>
      </Link>
    </div>
  )
}

export default BottomNav
