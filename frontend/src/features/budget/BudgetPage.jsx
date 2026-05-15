import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useFinance } from "../../context/FinancialContext";
import BudgetSetup from "../../components/BudgetSetup";
import BudgetProgressBar from "../../components/BudgetProgressBar";
import BottomNav from "../../components/BottomNav";
import AddExpense from "../../components/AddExpense";
import AddIncome from "../../components/AddIncome";
import { currentMonth, formatNaira } from "../../lib/utils";
import "../../styles/dashboard.css";

function BudgetPage() {
  const { budget, totalSpent, remaining, loadingFinance, fetchFinanceData } = useFinance();
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    fetchFinanceData(currentMonth());
  }, [fetchFinanceData]);

  const budgetAmount = budget?.amount ? Number(budget.amount) : null;
  const percentUsed = budgetAmount ? Math.min(Math.round((totalSpent / budgetAmount) * 100), 100) : 0;

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />

      <div className="main-content">
        <div className="page-header">
          <h1>Budget</h1>
          <p>Manage your monthly spending limit</p>
        </div>

        {loadingFinance ? (
          <div className="loading-state">Loading budget…</div>
        ) : (
          <>
            {budgetAmount ? (
              <div className="budget-summary-cards">
                <div className="budget-stat-card">
                  <span className="budget-stat-label">Monthly Budget</span>
                  <span className="budget-stat-value">{formatNaira(budgetAmount)}</span>
                </div>
                <div className="budget-stat-card spent">
                  <span className="budget-stat-label">Total Spent</span>
                  <span className="budget-stat-value">{formatNaira(totalSpent)}</span>
                </div>
                <div className={`budget-stat-card ${remaining < 0 ? "over" : "remaining"}`}>
                  <span className="budget-stat-label">
                    {remaining < 0 ? "Over Budget" : "Remaining"}
                  </span>
                  <span className="budget-stat-value">
                    {formatNaira(Math.abs(remaining))}
                  </span>
                </div>
                <div className="budget-stat-card usage">
                  <span className="budget-stat-label">Budget Used</span>
                  <span className="budget-stat-value">{percentUsed}%</span>
                </div>
              </div>
            ) : (
              <div className="empty-budget">
                <p>No budget set for {budget?.month || currentMonth()}.</p>
              </div>
            )}

            <BudgetProgressBar
              spent={totalSpent}
              total={budgetAmount}
              onTap={() => setShowBudgetSetup(true)}
            />

            <button
              className="sheet-submit-btn"
              style={{ margin: "1rem" }}
              onClick={() => setShowBudgetSetup(true)}
            >
              {budgetAmount ? "Update Budget" : "Set Budget"}
            </button>
          </>
        )}
      </div>

      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => { setFabOpen(false); setShowAddExpense(true); }}
        onAddIncome={() => { setFabOpen(false); setShowAddIncome(true); }}
      />

      {showBudgetSetup && (
        <BudgetSetup
          onClose={() => {
            setShowBudgetSetup(false);
            toast.success("Budget saved!");
          }}
        />
      )}
      {showAddExpense && (
        <AddExpense onClose={() => { setShowAddExpense(false); toast.success("Expense added"); }} />
      )}
      {showAddIncome && (
        <AddIncome onClose={() => { setShowAddIncome(false); toast.success("Income added"); }} />
      )}
    </div>
  );
}

export default BudgetPage;
