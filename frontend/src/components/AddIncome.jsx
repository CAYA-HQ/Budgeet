import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { financeApi } from "../lib/api";
import { useFinance } from "../context/FinancialContext";
import { currentMonth } from "../lib/utils";
import { toast } from "react-hot-toast";

const incomeTypes = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

function AddIncome({ onClose }) {
  const { fetchFinanceData, incomes } = useFinance();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [incomeType, setIncomeType] = useState(incomeTypes[1]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      await financeApi.addIncome({
        amount: parseFloat(amount),
        description: description.trim(),
        income_type: incomeType.id, // ← backend field name: income_type not incomeType
        date,
      });
      await fetchFinanceData(currentMonth());
      console.log(incomes);
      onClose();
      toast.success(incomes?.length > 0 ? "Income updated successfully" : "Income added successfully");
    } catch (err) {
      setError(err.message || "Failed to save income.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <button className="bottom-sheet-close" onClick={onClose}>
            <X size={20} />
          </button>
          <h2>Add Income</h2>
          <p>
            Enter the details of your income to help you track your finances.
          </p>
        </div>

        <div className="bottom-sheet-body">
          {error && (
            <div className="form-error" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

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
                  className={`income-type-btn ${incomeType.id === type.id ? "active" : ""}`}
                  onClick={() => setIncomeType(type)}
                  type="button"
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
          {incomes?.length > 0 ? (
            <button
              className="add-income-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Updating…" : "Update Income"}
            </button>
          ) : (
            <button
              className="add-income-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving…" : "Add Income"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddIncome;
