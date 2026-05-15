import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { useFinance } from "../../context/FinancialContext";
import AddExpense from "../../components/AddExpense";
import TransactionDetail from "../../components/TransactionDetail";
import BottomNav from "../../components/BottomNav";
import AddIncome from "../../components/AddIncome";
import { currentMonth, formatNaira } from "../../lib/utils";
import "../../styles/dashboard.css";

const CATEGORY_COLORS = {
  food: "#f59e0b", transport: "#3b82f6", shopping: "#8b5cf6",
  health: "#ef4444", housing: "#10b981", entertainment: "#f97316",
  education: "#6366f1", utilities: "#14b8a6", other: "#6b7280",
};

function ExpensesPage() {
  const { expenses, totalSpent, loadingFinance, fetchFinanceData } = useFinance();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchFinanceData(currentMonth());
  }, [fetchFinanceData]);

  const categories = ["all", ...new Set(expenses.map((e) => e.category))];

  const filtered =
    filterCategory === "all"
      ? expenses
      : expenses.filter((e) => e.category === filterCategory);

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />

      <div className="main-content">
        <div className="page-header">
          <h1>Expenses</h1>
          <p>Total this month: <strong>{formatNaira(totalSpent)}</strong></p>
        </div>

        {/* Category filter pills */}
        <div className="category-filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${filterCategory === cat ? "active" : ""}`}
              onClick={() => setFilterCategory(cat)}
              style={
                filterCategory === cat && cat !== "all"
                  ? { backgroundColor: CATEGORY_COLORS[cat] || "#000", color: "#fff" }
                  : {}
              }
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loadingFinance ? (
          <div className="loading-state">Loading expenses…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found.</p>
            <button
              className="sheet-submit-btn"
              onClick={() => setShowAddExpense(true)}
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <ul className="expenses-list">
            {filtered.map((expense) => (
              <li
                key={expense.id}
                className="expense-list-item"
                onClick={() =>
                  setSelectedTransaction({ ...expense, type: "expense", name: expense.label })
                }
              >
                <div
                  className="expense-category-dot"
                  style={{ backgroundColor: CATEGORY_COLORS[expense.category] || "#6b7280" }}
                />
                <div className="expense-info">
                  <span className="expense-label">{expense.label}</span>
                  <span className="expense-meta">
                    {expense.category} · {expense.date}
                  </span>
                </div>
                <span className="expense-amount">- {formatNaira(expense.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => { setFabOpen(false); setShowAddExpense(true); }}
        onAddIncome={() => { setFabOpen(false); setShowAddIncome(true); }}
      />

      {showAddExpense && (
        <AddExpense
          onClose={() => {
            setShowAddExpense(false);
            toast.success("Expense added");
          }}
        />
      )}
      {showAddIncome && (
        <AddIncome
          onClose={() => {
            setShowAddIncome(false);
            toast.success("Income added");
          }}
        />
      )}
      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}

export default ExpensesPage;
