import { useState } from 'react'
import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'
import '../../styles/dashboard.css'

const allMockData = {
  user: { name: 'Ade' },
  budget: { spent: 0, total: null },
  today: {
    totalSpend: 0,
    transactions: [],
  },
  thisWeek: {
    totalSpend: 0,
    transactions: [],
  },
  thisMonth: {
    totalSpend: 0,
    transactions: [],
  },
}

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('today')
  const [fabOpen, setFabOpen] = useState(false)

  const getFilteredData = () => {
    switch (activeFilter) {
      case 'thisWeek': return allMockData.thisWeek
      case 'thisMonth': return allMockData.thisMonth
      default: return allMockData.today
    }
  }

  const filteredData = getFilteredData()

  const handleAddExpense = () => setFabOpen(true)
  const handleAddIncome = () => setFabOpen(false)

  return (
    <div className="app-layout">
      <SideNav />
      <div className="main-content">
        <GreetingHeader name={allMockData.user.name} />
        <FilterTabs onFilterChange={setActiveFilter} />
        <TotalSpendCard amount={filteredData.totalSpend} />
        <BudgetProgressBar
          spent={allMockData.budget.spent}
          total={allMockData.budget.total}
        />
        <TransactionList
          transactions={filteredData.transactions}
          onAddExpense={handleAddExpense}
        />
      </div>
      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={handleAddExpense}
        onAddIncome={handleAddIncome}
      />
    </div>
  )
}

export default DashboardPage