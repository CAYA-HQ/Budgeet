import { Wallet } from 'lucide-react'

function EmptyState({ onAddExpense }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Wallet size={40} />
      </div>
      <h3 className="empty-state-title">Nothing here yet</h3>
      <p className="empty-state-subtitle">
        Tap the + button to log your first expense
      </p>
      <button className="empty-state-cta" onClick={onAddExpense}>
        Add your first expense
      </button>
    </div>
  )
}

export default EmptyState