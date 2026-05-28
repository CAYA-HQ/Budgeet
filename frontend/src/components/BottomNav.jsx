import { Link, useLocation } from 'react-router-dom'
import { Home, Wallet } from 'lucide-react'
import FABMenu from './FABMenu'

function BottomNav({ fabOpen, setFabOpen, onAddExpense, onAddIncome }) {
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
        isOpen={fabOpen}
        onToggle={setFabOpen}
        onAddExpense={onAddExpense}
        onAddIncome={onAddIncome}
      />

      <Link
        to="/dashboard/budget"
        className={`bottom-nav-item ${location.pathname === '/dashboard/budget' ? 'active' : ''}`}
      >
        <Wallet size={24} />
        <span>Budget</span>
      </Link>
    </div>
  )
}

export default BottomNav