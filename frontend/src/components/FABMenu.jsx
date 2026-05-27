import { Plus, X, Receipt, Wallet } from 'lucide-react'

function FABMenu({ isOpen, onToggle, onAddExpense, onAddIncome }) {
  const handleAddExpense = () => {
    onToggle(false)
    if (onAddExpense) onAddExpense()
  }

  const handleAddIncome = () => {
    onToggle(false)
    if (onAddIncome) onAddIncome()
  }

  return (
    <div className="fab-menu">
      {isOpen && (
        <div className="fab-options">
          <button className="fab-option" onClick={handleAddIncome}>
            <Wallet size={18} />
            <span>Add Income</span>
          </button>
          <button className="fab-option" onClick={handleAddExpense}>
            <Receipt size={18} />
            <span>Add Expense</span>
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