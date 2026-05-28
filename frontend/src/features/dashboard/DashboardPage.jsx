import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import AddExpense from '../../components/AddExpense'
import AddIncome from '../../components/AddIncome'
import BudgetSetup from '../../components/BudgetSetup'
import TransactionDetail from '../../components/TransactionDetail'
import CalendarView from '../../components/CalendarView'
import { useFinance } from '../../context/FinancialContext'
import { currentMonth } from '../../lib/utils'
import '../../styles/dashboard.css'

const filterByDate = (transactions, filter) => {
  const now = new Date()
  return transactions.filter((t) => {
    const txDate = new Date(t.date)
    if (filter === 'today')
      return txDate.toDateString() === now.toDateString()
    if (filter === 'thisWeek') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return txDate >= startOfWeek
    }
    if (filter === 'thisMonth')
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      )
    return true
  })
}

const toastStyle = {
  style: {
    background: '#000000', color: '#ffffff',
    fontSize: '14px', fontWeight: '600',
    borderRadius: '12px', padding: '12px 20px',
  },
  success: { iconTheme: { primary: '#ffffff', secondary: '#000000' } },
}

function DashboardPage() {
  const {
    budget,
    expenses,
    incomes,
    totalSpent,
    loadingFinance,
    fetchFinanceData,
  } = useFinance()

  const [activeFilter, setActiveFilter] = useState('today')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showBudgetSetup, setShowBudgetSetup] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)

  useEffect(() => {
    fetchFinanceData(currentMonth())
  }, [fetchFinanceData])

  const allTransactions = [
    ...expenses.map((e) => ({ ...e, type: 'expense', name: e.label })),
    ...incomes.map((i) => ({ ...i, type: 'income', name: i.description || 'Income' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredTransactions = filterByDate(allTransactions, activeFilter)

  const filteredTotalSpend = filterByDate(
    expenses.map((e) => ({ ...e, type: 'expense' })),
    activeFilter
  ).reduce((sum, t) => sum + Number(t.amount), 0)

  const handleDeleteTransaction = (transaction) => {
    setSelectedTransaction(null)
    toast.success('Expense deleted')
  }

  return (
    <div className="main-content">
      <Toaster position="top-center" toastOptions={{ duration: 2500, ...toastStyle }} />

      <FilterTabs onFilterChange={setActiveFilter} />

      <TotalSpendCard amount={filteredTotalSpend} />

      <BudgetProgressBar
        spent={totalSpent}
        total={budget?.amount ? Number(budget.amount) : null}
        onTap={() => setShowBudgetSetup(true)}
      />

      {loadingFinance ? (
        <div className="loading-state">Loading transactions…</div>
      ) : activeFilter === 'calendar' ? (
        <CalendarView
          transactions={allTransactions}
          onTapTransaction={setSelectedTransaction}
        />
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          onAddExpense={() => setShowAddExpense(true)}
          onTapTransaction={setSelectedTransaction}
        />
      )}

      {showAddExpense && (
        <AddExpense
          onClose={() => {
            setShowAddExpense(false)
            toast.success('Expense added')
          }}
        />
      )}

      {showAddIncome && (
        <AddIncome
          onClose={() => {
            setShowAddIncome(false)
            toast.success('Income added')
          }}
        />
      )}

      {editingTransaction && (
        <AddExpense
          existing={editingTransaction}
          onClose={() => {
            setEditingTransaction(null)
            toast.success('Expense updated')
          }}
        />
      )}

      {showBudgetSetup && (
        <BudgetSetup
          onClose={() => {
            setShowBudgetSetup(false)
            toast.success('Budget saved')
          }}
        />
      )}

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onEdit={() => {
            setEditingTransaction(selectedTransaction)
            setSelectedTransaction(null)
          }}
          onDelete={() => handleDeleteTransaction(selectedTransaction)}
        />
      )}
    </div>
  )
}

export default DashboardPage