// import { useState } from 'react'
// import { Search } from 'lucide-react'
// import { useOutletContext } from 'react-router-dom'
// import { toast, Toaster } from 'react-hot-toast'
// import TransactionItem from '../../components/TransactionItem'
// import TransactionDetail from '../../components/TransactionDetail'
// import AddExpense from '../../components/AddExpense'
// import EmptyState from '../../components/EmptyState'
// import '../../styles/dashboard.css'
// import '../../styles/expenses.css'

// function ExpensesPage() {
//   const [search, setSearch] = useState('')
//   const [activeCategory, setActiveCategory] = useState('all')
//   const [selectedTransaction, setSelectedTransaction] = useState(null)
//   const [editingTransaction, setEditingTransaction] = useState(null)
//   const [expenses, setExpenses] = useState([])

//   const categories = [
//     { id: 'all', label: 'All' },
//     { id: 'food', label: 'Food' },
//     { id: 'transport', label: 'Transport' },
//     { id: 'shopping', label: 'Shopping' },
//     { id: 'healthcare', label: 'Healthcare' },
//     { id: 'housing', label: 'Housing' },
//     { id: 'entertainment', label: 'Entertainment' },
//     { id: 'education', label: 'Education' },
//     { id: 'miscellaneous', label: 'Miscellaneous' },
//   ]

//   const filtered = expenses.filter((e) => {
//     const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
//     const matchesCategory = activeCategory === 'all' || e.category === activeCategory
//     return matchesSearch && matchesCategory
//   })

//   const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

//   const formatAmount = (amount) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//     }).format(amount)
//   }

//   const handleDeleteTransaction = (transaction) => {
//     setExpenses((prev) => prev.filter((e) => e !== transaction))
//     setSelectedTransaction(null)
//     toast.success('Expense deleted')
//   }

//   return (
//     <div className="expenses-page">
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 2500,
//           style: {
//             background: '#000000',
//             color: '#ffffff',
//             fontSize: '14px',
//             fontWeight: '600',
//             borderRadius: '12px',
//             padding: '12px 20px',
//           },
//         }}
//       />

//       <div className="expenses-header">
//         <h1>Expenses</h1>
//         <p className="expenses-total">{formatAmount(totalExpenses)}</p>
//       </div>

//       <div className="expenses-search">
//         <Search size={16} className="search-icon" />
//         <input
//           type="text"
//           placeholder="Search expenses..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="search-input"
//         />
//       </div>

//       <div className="expenses-categories">
//         {categories.map((cat) => (
//           <button
//             key={cat.id}
//             className={`expense-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
//             onClick={() => setActiveCategory(cat.id)}
//           >
//             {cat.label}
//           </button>
//         ))}
//       </div>

//       {filtered.length === 0 ? (
//         <EmptyState onAddExpense={() => {}} />
//       ) : (
//         <div className="expenses-list">
//           {filtered.map((expense, index) => (
//             <TransactionItem
//               key={index}
//               icon={expense.icon}
//               name={expense.name}
//               time={expense.time}
//               amount={expense.amount}
//               isNew={index === 0}
//               onTap={() => setSelectedTransaction(expense)}
//             />
//           ))}
//         </div>
//       )}

//       {selectedTransaction && (
//         <TransactionDetail
//           transaction={selectedTransaction}
//           onClose={() => setSelectedTransaction(null)}
//           onEdit={() => {
//             setEditingTransaction(selectedTransaction)
//             setSelectedTransaction(null)
//           }}
//           onDelete={() => handleDeleteTransaction(selectedTransaction)}
//         />
//       )}

//       {editingTransaction && (
//         <AddExpense
//           onClose={() => setEditingTransaction(null)}
//           onSave={(updated) => {
//             setExpenses((prev) =>
//               prev.map((e) =>
//                 e === editingTransaction ? { ...updated, type: 'expense' } : e
//               )
//             )
//             setEditingTransaction(null)
//             toast.success('Expense updated')
//           }}
//           existing={editingTransaction}
//         />
//       )}
//     </div>
//   )
// }

// export default ExpensesPage


import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useFinance } from "../../context/FinancialContext";
import AddExpense from "../../components/AddExpense";
import AddIncome from "../../components/AddIncome";
import BottomNav from "../../components/BottomNav";
import { currentMonth, formatNaira } from "../../lib/utils";
import "../../styles/dashboard.css";

// Dynamic meta parameters for the row list matching the image's styling palette
const EXPENSE_ROW_META = {
  housing: { label: "Housing", icon: "🏠", color: "bg-blue-600" },
  transport: { label: "Transport", icon: "🚗", color: "bg-purple-500" },
  shopping: { label: "Shopping", icon: "🛍️", color: "bg-amber-500" },
  bills: { label: "Bills", icon: "⚡", color: "bg-slate-500" },
  health: { label: "Health", icon: "❤️", color: "bg-orange-500" },
};

function ExpensesPage() {
  const { expenses, totalSpent, loadingFinance, fetchFinanceData } = useFinance();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  
  // High-level range time filter (This Week, This Month, This Year)
  const [timeRange, setTimeRange] = useState("This Year");

  useEffect(() => {
    fetchFinanceData(currentMonth());
  }, [fetchFinanceData]);

  // Derive category spending from the expenses array if the backend doesn't provide a breakdown
  const categorySpending = expenses?.categoryBreakdown || Object.values(
    (expenses || []).reduce((acc, exp) => {
      const cat = exp.category || 'other';
      if (!acc[cat]) {
        acc[cat] = { 
          id: cat, 
          type: cat, 
          spent: 0, 
          total: 0,
          pctOfTotal: 0 
        };
      }
      acc[cat].spent += Number(exp.amount);
      acc[cat].pctOfTotal = totalSpent > 0 ? Math.round((acc[cat].spent / totalSpent) * 100) : 0;
      return acc;
    }, {})
  );

  const avgTransaction = expenses.length > 0 ? totalSpent / expenses.length : 0;
  const biggestExpenseObj = expenses.length > 0 
    ? [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0] 
    : null;
  const biggestExpenseAmount = biggestExpenseObj ? Number(biggestExpenseObj.amount) : 0;
  const biggestExpenseLabel = biggestExpenseObj ? (biggestExpenseObj.label || biggestExpenseObj.name || "Expense") : "N/A";

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />

      <div className="main-content px-6 py-8 max-w-7xl mx-auto space-y-8 w-full bg-slate-50/30">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
          
          <div className="flex items-center gap-3">
            
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-500">
              {["This week", "This Month", "This Year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    timeRange === range 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "hover:text-slate-800"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowAddExpense(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1 shadow-sm"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {loadingFinance ? (
          <div className="loading-state text-center text-slate-500 py-12">Loading expenses summary…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-sm font-semibold text-slate-500">Total Spent/Year</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900">{formatNaira(totalSpent || 0)}</span>
                    <span className="text-xs text-slate-400 font-medium mt-1">{expenses?.length || 0} transactions</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold text-lg">📉</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-sm font-semibold text-slate-500">Avg/transaction</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900">{formatNaira(avgTransaction)}</span>
                    <span className="text-xs text-slate-400 font-medium mt-1">Across selected range</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">💳</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-sm font-semibold text-slate-500">Biggest expense</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-slate-900">{formatNaira(biggestExpenseAmount)}</span>
                    <span className="text-xs text-slate-400 font-medium mt-1">{biggestExpenseLabel}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg">📈</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Spending by category</h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Last 12 months</p>
                </div>
                <span className="text-base font-bold text-slate-800">{formatNaira(totalSpent || 0)}</span>
              </div>

              <div className="divide-y divide-slate-100/70">
                {categorySpending.map((row) => {
                  const meta = EXPENSE_ROW_META[row.type] || { label: "Other", icon: "📁", color: "bg-slate-600" };
                  const barPercentage = (row.total || totalSpent) > 0 ? Math.min(Math.round((row.spent / (row.total || totalSpent)) * 100), 100) : 0;

                  return (
                    <div key={row.id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3">
                      <div className="flex justify-between items-start text-xs font-semibold">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{meta.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-slate-800 text-sm font-bold">{meta.label}</span>
                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {row.pctOfTotal}% of total spend
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-slate-500 flex items-center gap-1 font-bold text-right">
                          <span className="text-slate-800">{formatNaira(row.spent)}</span>
                          {row.total > 0 && (
                            <>
                              <span className="text-slate-300 font-normal">/</span>
                              <span>{formatNaira(row.total)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${meta.color}`}
                          style={{ width: `${barPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </>
        )}
      </div>

      {/* Bottom Nav System Components for mobile */}
      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => { setFabOpen(false); setShowAddExpense(true); }}
        onAddIncome={() => { setFabOpen(false); setShowAddIncome(true); }}
      />

      {showAddExpense && (
        <AddExpense onClose={() => { setShowAddExpense(false); toast.success("Expense added"); }} />
      )}
      {showAddIncome && (
        <AddIncome onClose={() => { setShowAddIncome(false); toast.success("Income added"); }} />
      )}
    </div>
  );
}

export default ExpensesPage;