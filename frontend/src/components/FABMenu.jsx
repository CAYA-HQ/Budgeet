import { useNavigate } from 'react-router-dom'
import { Plus, X, Receipt, Wallet } from 'lucide-react'

function FABMenu({ isOpen, onToggle, onAddExpense, onAddIncome }) {
  const navigate = useNavigate()

  const handleAddExpense = () => {
    onToggle(false)
    if (onAddExpense) onAddExpense()
  }

  const handleAddIncome = () => {
    onToggle(false)
    if (onAddIncome) onAddIncome()
    console.log("Button was clicked")
  }

  return (
    <div className="fab-menu">
      {isOpen && (
        <div className="fab-options">
          <button className="fab-option" onClick={handleAddIncome}>
            <Wallet size={18} />
            <span>Add Income</span>
          </button>
          <button className="fab-option" onClick={() => navigate('/dashboard/expenses')}>
            <Receipt size={18} />
            <span>Expense</span>
          </button>
        </div>
      )}
      <button className="fab-button" onClick={() => onToggle(!isOpen)}>
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  )
}

export default FABMenu