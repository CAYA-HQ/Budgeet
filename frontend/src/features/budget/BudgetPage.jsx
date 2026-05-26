
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useFinance } from "../../context/FinancialContext";
import BudgetSetup from "../../components/BudgetSetup";
// We can use individual Category cards for the new layout grid
import CategoryBudgetCard from "../../components/CategoryBudgetCard"; 
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

  // Fallback category mock data matching the image if it doesn't exist in your context yet
  const categoriesList = budget?.categories || [
    { id: 1, name: "Food & Groceries", icon: "🛒", spent: 42000, total: 60000, color: "bg-blue-600" },
    { id: 2, name: "Transport", icon: "🚗", spent: 28000, total: 30000, color: "bg-amber-500" },
    { id: 3, name: "Entertainment", icon: "🎮", spent: 18500, total: 15000, color: "bg-red-600" },
    { id: 4, name: "Bill & Utilities", icon: "⚡", spent: 22000, total: 50000, color: "bg-blue-600" },
    { id: 5, name: "Shopping", icon: "🛍️", spent: 22000, total: 35000, color: "bg-blue-600" },
    { id: 6, name: "Health", icon: "💊", spent: 6000, total: 18000, color: "bg-blue-600" },
    { id: 7, name: "Education", icon: "📚", spent: 12000, total: 75000, color: "bg-blue-600" },
    { id: 8, name: "Miscellaneous", icon: "🎁", spent: 12000, total: 17000, color: "bg-blue-600" },
  ];

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />

      <div className="main-content px-6 py-8 max-w-7xl mx-auto space-y-8 w-full flex flex-col justify-between gap-4">
        <div className="page-header flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budgets</h1>
          <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm"
                  onClick={() => setShowBudgetSetup(true)}
                >
                  + New budget
                </button>
        </div>

        {loadingFinance ? (
          <div className="loading-state">Loading budget…</div>
        ) : (
          <>
            {budgetAmount ? (
              /* Top summary row matching Figma cards layout */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-semibold text-slate-500">Total Budget</span>
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {formatNaira(budgetAmount)}
                  </span>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-semibold text-slate-500">Spent</span>
                  <span className="text-2xl font-bold tracking-tight text-red-600">
                    {formatNaira(totalSpent)}
                  </span>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <span className="text-sm font-semibold text-slate-500">Remaining</span>
                  <span className="text-2xl font-bold tracking-tight text-green-600">
                    {formatNaira(remaining)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-500">No budget set for {budget?.month || currentMonth()}.</p>
              </div>
            )}

            {/* Categories Canvas Section */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Categories</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">April 8 active categories</p>
                </div>
                
                
              </div>

              {/* Grid Layout for components */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoriesList.map((category) => (
                  <CategoryBudgetCard 
                    key={category.id} 
                    category={category} 
                    onEdit={() => setShowBudgetSetup(true)}
                  />
                ))}
              </div>
            </div>
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