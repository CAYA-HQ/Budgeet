import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import CategoryPicker, { categories } from './CategoryPicker'

function AddExpense({ onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const handleSave = () => {
    if (!amount) return
    const expense = {
      amount: parseFloat(amount),
      description,
      category: category.id,
      icon: category.id,
      name: description || category.label,
      date,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }
    onSave(expense)
    onClose()
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose}>
        <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="bottom-sheet-handle" />
          <div className="bottom-sheet-header">
            <button className="bottom-sheet-close" onClick={onClose}>
              <X size={20} />
            </button>
            <h2>Add new expense</h2>
            <p>Enter the details of your expense to help you track your spending.</p>
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
                placeholder="e.g. Lunch at Chicken Republic"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-input"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <button
                className="select-input"
                onClick={() => setShowCategoryPicker(true)}
              >
                <span>{category.label}</span>
                <ChevronRight size={18} />
              </button>
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
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {showCategoryPicker && (
        <CategoryPicker
          selected={category}
          onSelect={setCategory}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}
    </>
  )
}

export default AddExpense