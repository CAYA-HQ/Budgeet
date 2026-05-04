import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'
import AddExpense from '../../components/AddExpense'
import AddIncome from '../../components/AddIncome'
import BudgetSetup from '../../components/BudgetSetup'
import TransactionDetail from '../../components/TransactionDetail'
import CalendarView from '../../components/CalendarView'
import '../../styles/dashboard.css'

const allMockData = {
  user: { name: 'Ade' },
}

const filterByDate = (transactions, filter) => {
  const now = new Date()
  return transactions.filter((t) => {
    const txDate = new Date(t.date)
    if (filter === 'today') {
      return txDate.toDateString() === now.toDateString()
    }
    if (filter === 'thisWeek') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      return txDate >= startOfWeek
    }
    if (filter === 'thisMonth') {
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      )
    }
    return true
  })
}

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('today')
  const [fabOpen, setFabOpen] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [showBudgetSetup, setShowBudgetSetup] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState({ total: null })
  const [editingTransaction, setEditingTransaction] = useState(null)

  const filteredTransactions = filterByDate(transactions, activeFilter)
  const filteredExpenses = filteredTransactions.filter((t) => t.type === 'expense')
  const totalSpend = filteredExpenses.reduce((sum, t) => sum + t.amount, 0)

  const thisMonthExpenses = filterByDate(transactions, 'thisMonth')
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const handleAddExpense = () => {
    setFabOpen(false)
    setShowAddExpense(true)
  }

  const handleAddIncome = () => {
    setFabOpen(false)
    setShowAddIncome(true)
  }

  const handleSaveExpense = (expense) => {
    setTransactions((prev) => [{ ...expense, type: 'expense' }, ...prev])
    toast.success('Expense added')
  }

  const handleSaveIncome = (income) => {
    setTransactions((prev) => [{ ...income, type: 'income' }, ...prev])
    toast.success('Income added')
  }

  const handleSaveBudget = (amount) => {
    setBudget({ total: amount })
    toast.success('Budget set')
  }

  const handleDeleteTransaction = (transaction) => {
    setTransactions((prev) => prev.filter((t) => t !== transaction))
    setSelectedTransaction(null)
    toast.success('Expense deleted')
  }

  return (
    <div className="app-layout">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#000000',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#ffffff',
              secondary: '#000000',
            },
          },
        }}
      />
      <SideNav />
      <div className="main-content">
  <GreetingHeader name={allMockData.user.name} />
  <FilterTabs onFilterChange={setActiveFilter} />
  <TotalSpendCard amount={totalSpend} />
  <BudgetProgressBar
    spent={thisMonthExpenses}
    total={budget.total}
    onTap={() => setShowBudgetSetup(true)}
  />
  {activeFilter === 'calendar' ? (
    <CalendarView
      transactions={transactions}
      onTapTransaction={setSelectedTransaction}
    />
  ) : (
    <TransactionList
      transactions={filteredTransactions}
      onAddExpense={handleAddExpense}
      onTapTransaction={setSelectedTransaction}
    />
  )}
</div>
      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={handleAddExpense}
        onAddIncome={handleAddIncome}
      />
      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onSave={handleSaveExpense}
        />
      )}
      {showAddIncome && (
        <AddIncome
          onClose={() => setShowAddIncome(false)}
          onSave={handleSaveIncome}
        />
      )}
      {editingTransaction && (
  <AddExpense
    onClose={() => setEditingTransaction(null)}
    onSave={(updated) => {
      setTransactions((prev) =>
        prev.map((t) =>
          t === editingTransaction ? { ...updated, type: 'expense' } : t
        )
      )
      setEditingTransaction(null)
      toast.success('Expense updated')
    }}
    existing={editingTransaction}
  />
)}

      {showBudgetSetup && (
        <BudgetSetup
          current={budget.total}
          onClose={() => setShowBudgetSetup(false)}
          onSave={handleSaveBudget}
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