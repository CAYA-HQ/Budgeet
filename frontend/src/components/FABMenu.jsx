import { useNavigate } from 'react-router-dom'
import { Plus, X, Receipt, Wallet } from 'lucide-react'
import { useFinance } from '../context/FinancialContext'

function FABMenu({ isOpen, onToggle, onAddExpense, onAddIncome }) {
  const navigate = useNavigate()

  const { incomes, loading } = useFinance()

  // const handleAddExpense = () => {
  //   onToggle(false)
  //   if (onAddExpense) onAddExpense()
  // }

  const handleAddIncome = () => {
    onToggle(false)
    if (onAddIncome) onAddIncome()
  }

  return (
    <div className="fab-menu">
      {isOpen && (
        <div className="fab-options">
          {incomes?.length > 0 ? (
            <button
              className="add-income-btn w-[10rem] md:w-full"
              onClick={handleAddIncome}
              disabled={loading}
            >
              {loading ? "Updating…" : "Update Income"}
            </button>
          ) : (
            <button
              className="add-income-btn"
              onClick={handleAddIncome}
              disabled={loading}
            >
              {loading ? "Saving…" : "Add Income"}
            </button>
          )}
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