import { useState } from 'react'
import { Plus, X, Receipt, Wallet } from 'lucide-react'

function FABMenu({ onAddExpense, onAddIncome }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleAddExpense = () => {
    setIsOpen(false)
    if (onAddExpense) onAddExpense()
  }

  const handleAddIncome = () => {
    setIsOpen(false)
    if (onAddIncome) onAddIncome()
  }

  return (
    <div className="fab-menu">
      {isOpen && (
        <div className="fab-options">
          <button className="fab-option" onClick={handleAddIncome}>
            <Wallet size={20} />
            <span>Add Income</span>
          </button>
          <button className="fab-option" onClick={handleAddExpense}>
            <Receipt size={20} />
            <span>Add Expense</span>
          </button>
        </div>
      )}
      <button className="fab-button" onClick={handleToggle}>
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  )
}

export default FABMenu
