import { useState } from "react";
import { X } from "lucide-react";
import { financeApi } from "../lib/api";
import { useFinance } from "../context/FinancialContext";
import { currentMonth } from "../lib/utils";

function BudgetSetup({ onClose }) {
  const { fetchFinanceData, budget } = useFinance();
  const [amount, setAmount] = useState(budget?.amount ? String(budget.amount) : "");
  const [month, setMonth] = useState(currentMonth());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }
    setLoading(true);
    try {
      await financeApi.setBudget({ amount: Number(amount), month });
      await fetchFinanceData(month);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save budget.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <button className="bottom-sheet-close" onClick={onClose}><X size={20} /></button>
          <h2>{budget ? "Update Budget" : "Set Monthly Budget"}</h2>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="sheet-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Budget Amount (₦)</label>
            <input
              type="number"
              placeholder="e.g. 150000"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sheet-submit-btn" disabled={loading}>
            {loading ? "Saving…" : budget ? "Update Budget" : "Set Budget"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BudgetSetup;
