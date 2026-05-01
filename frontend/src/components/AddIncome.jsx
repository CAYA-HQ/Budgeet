import { useState } from 'react'
import { X } from 'lucide-react'

const incomeTypes = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
]

function AddIncome({ onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [incomeType, setIncomeType] = useState(incomeTypes[1])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSave = () => {
    if (!amount) return
    const income = {
      amount: parseFloat(amount),
      description,
      incomeType: incomeType.id,
      date,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }
    onSave(income)
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
          <h2>Add Income</h2>
          <p>Enter the details of your income to help you track your finances.</p>
        </div>

        <div className="bottom-sheet-body">
          <div className="form-group">
            <label>Enter Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₦</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g. Monthly salary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input"
            />
          </div>

          <div className="form-group">
            <label>Income Type</label>
            <div className="income-type-selector">
              {incomeTypes.map((type) => (
                <button
                  key={type.id}
                  className={`income-type-btn ${incomeType.id === type.id ? 'active' : ''}`}
                  onClick={() => setIncomeType(type)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-input"
            />
          </div>

          <button className="add-expense-btn" onClick={handleSave}>
            Save Income
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddIncome