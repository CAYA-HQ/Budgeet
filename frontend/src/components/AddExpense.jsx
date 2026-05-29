import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import CategoryPicker, { categories } from './CategoryPicker'
import { financeApi } from "../lib/api";
import { useFinance } from "../context/FinancialContext";
import { toast} from "react-hot-toast"
// import { currentMonth } from "../lib/utils";

function AddExpense({ onClose, onSave, existing }) {
  const { fetchFinanceData } = useFinance();
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [description, setDescription] = useState(existing ? (existing.label || existing.name || existing.description || "") : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(
    existing
      ? categories.find((c) => c.id === existing.category) || categories[0]
      : categories[0]
  )
  const [date, setDate] = useState(
    existing ? existing.date : new Date().toISOString().split('T')[0]
  )
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      if (!amount || Number(amount) <= 0) {
        setError("Please enter a valid positive amount.");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          label: description.trim() || category.label,
          amount: Number(amount),
          category: category.id,
          date: date,
        };

        let result;
        if (existing) {
          if (typeof financeApi.updateExpense !== 'function') throw new Error("API method updateExpense is missing in api.js");
          result = await financeApi.updateExpense(existing.id, payload);
        } else {
          if (typeof financeApi.addExpense !== 'function') throw new Error("API method addExpense is missing in api.js");
          result = await financeApi.addExpense(payload);
        }

        // Refresh data for the month of the expense
        await fetchFinanceData(date.substring(0, 7));

        if (onSave) {
          onSave(result || payload);
        }
        onClose();
        toast.success("Expense added");
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to save expense.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose}>
        <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="bottom-sheet-handle" />
          <div className="bottom-sheet-header">
            <button type="button" className="bottom-sheet-close" onClick={onClose}>
              <X size={20} />
            </button>
            <h2>{existing ? 'Edit Expense' : 'Add new expense'}</h2>
            <p>
              {existing
                ? 'Update the details of your expense.'
                : 'Enter the details of your expense to help you track your spending.'}
            </p>
          </div>
          
          {error && <div className="form-error px-6 pb-2 text-red-500 text-sm font-medium">{error}</div>}

          <form className="bottom-sheet-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Enter Amount</label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">₦</span>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  required
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
                type="button"
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
                required
              />
            </div>

            <button type="submit" className="add-expense-btn bg-[var(--budgeet-primary)]" disabled={loading}>
              {loading ? "Saving…" : (existing ? 'Update Expense' : 'Add Expense')}
            </button>
          </form>
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