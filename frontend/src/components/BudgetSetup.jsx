import { useState } from 'react'
import { X } from 'lucide-react'

function BudgetSetup({ current, onClose, onSave }) {
  const [amount, setAmount] = useState(current ? String(current) : '')

  const handleSave = () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0) return
    onSave(parsed)
    onClose()
  }

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <button className="bottom-sheet-close" onClick={onClose}>
            <X size={20} />
          </button>
          <h2>{current ? 'Update Budget' : 'Set a Budget'}</h2>
          <p>Set a monthly spending limit to keep your finances on track.</p>
        </div>

        <div className="bottom-sheet-body">
          <div className="form-group">
            <label>Monthly Budget Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₦</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
                autoFocus
              />
            </div>
          </div>

          <button className="add-expense-btn" onClick={handleSave}>
            {current ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BudgetSetup