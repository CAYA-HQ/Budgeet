import { useState } from "react";
import { X, Pencil, Trash2 } from "lucide-react";
import { financeApi } from "../lib/api";
import { useFinance } from "../context/FinancialContext";
import { currentMonth, formatNaira } from "../lib/utils";

function TransactionDetail({ transaction, onClose }) {
  const { fetchFinanceData } = useFinance();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isExpense = transaction.type === "expense" || !transaction.income_type;

  const handleDelete = async () => {
    if (!window.confirm("Delete this transaction?")) return;
    setDeleting(true);
    setError("");
    try {
      if (isExpense) {
        await financeApi.deleteExpense(transaction.id);
      } else {
        await financeApi.deleteIncome(transaction.id);
      }
      await fetchFinanceData(currentMonth());
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete.");
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-NG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <button className="bottom-sheet-close" onClick={onClose}><X size={20} /></button>
          <h2>{isExpense ? "Expense" : "Income"} transaction details</h2>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="transaction-detail-body">
          <div className={`transaction-detail-amount ${!isExpense ? "income" : ""}`}>
            {isExpense ? "- " : "+ "}{formatNaira(transaction.amount)}
          </div>

          <div className="transaction-detail-name">
            {transaction.label || transaction.name || transaction.description}
          </div>

          <div className="transaction-detail-rows">
            {transaction.category && (
              <div className="transaction-detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value" style={{ textTransform: "capitalize" }}>
                  {transaction.category}
                </span>
              </div>
            )}
            {transaction.income_type && (
              <div className="transaction-detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value" style={{ textTransform: "capitalize" }}>
                  {transaction.income_type}
                </span>
              </div>
            )}
            <div className="transaction-detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{formatDate(transaction.date)}</span>
            </div>
          </div>

          <div className="transaction-detail-actions">
            <button
              className="detail-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 size={16} />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetail;
