import { useState } from 'react'
import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'
import AddExpense from '../../components/AddExpense'
import AddIncome from '../../components/AddIncome'
import '../../styles/dashboard.css'

const allMockData = {
  user: { name: 'Ade' },
  budget: { spent: 0, total: null },
  today: { totalSpend: 0, transactions: [] },
  thisWeek: { totalSpend: 0, transactions: [] },
  thisMonth: { totalSpend: 0, transactions: [] },
}

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('today')
  const [fabOpen, setFabOpen] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [totalSpend, setTotalSpend] = useState(0)

  const handleAddExpense = () => {
    setFabOpen(false)
    setShowAddExpense(true)
  }

  const handleAddIncome = () => {  
    setFabOpen(false)
    setShowAddIncome(true)
  }

  const handleSaveExpense = (expense) => {
    setTransactions([expense, ...transactions])
    setTotalSpend(totalSpend + expense.amount)
  }

  const handleSaveIncome = (income) => { 
    setTransactions([income, ...transactions])
  }

  return (
    <div className="app-layout">
      <SideNav />
      <div className="main-content">
        <GreetingHeader name={allMockData.user.name} />
        <FilterTabs onFilterChange={setActiveFilter} />
        <TotalSpendCard amount={totalSpend} />
        <BudgetProgressBar
          spent={allMockData.budget.spent}
          total={allMockData.budget.total}
        />
        <TransactionList
          transactions={transactions}
          onAddExpense={handleAddExpense}
        />
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
    </div>
  )
}

export default DashboardPage