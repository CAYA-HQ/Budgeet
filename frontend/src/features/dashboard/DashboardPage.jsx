import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'

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
  const handleFilterChange = (filter) => {
    console.log('Active filter:', filter)
  }

  const handleAddExpense = () => {
    console.log('Add Expense clicked')
  }

  const handleAddIncome = () => {
    console.log('Add Income clicked')
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
        <TransactionList transactions={mockData.transactions} />
      </div>
      <BottomNav
        onAddExpense={handleAddExpense}
        onAddIncome={handleAddIncome}
      />
    </div>
  )
}

export default DashboardPage
