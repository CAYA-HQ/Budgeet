import { useState } from 'react'
import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'
import '../../styles/dashboard.css'

const mockData = {
  user: {
    name: 'Ade',
  },
  totalSpend: 0,
  budget: {
    spent: 0,
    total: null,
  },
  transactions: [],
}

function DashboardPage() {
  const [fabOpen, setFabOpen] = useState(false)

  const handleFilterChange = (filter) => {
    console.log('Active filter:', filter)
  }

  const handleAddExpense = () => {
    setFabOpen(true)
  }

  const handleAddIncome = () => {
    setFabOpen(false)
  }

  return (
    <div className="app-layout">
      <SideNav />
      <div className="main-content">
        <GreetingHeader name={mockData.user.name} />
        <FilterTabs onFilterChange={handleFilterChange} />
        <TotalSpendCard amount={mockData.totalSpend} />
        <BudgetProgressBar
          spent={mockData.budget.spent}
          total={mockData.budget.total}
        />
        <TransactionList
          transactions={mockData.transactions}
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