import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'

const demoData = {
  totalSpend: 45200,
  budget: {
    spent: 45000,
    total: 50000,
  },
  transactions: [
    { icon: 'food', name: 'Chicken Republic', time: '9:21 AM', amount: 2500 },
    { icon: 'transport', name: 'Uber', time: '10:15 AM', amount: 1800 },
    { icon: 'shopping', name: 'Zara', time: '11:30 AM', amount: 25000 },
    { icon: 'healthcare', name: 'Pharmacy', time: '12:45 PM', amount: 3400 },
    { icon: 'housing', name: 'Rent', time: '2:00 PM', amount: 12500 },
  ],
}

function DemoDashboardPage() {
  const handleFilterChange = (filter) => {
    console.log('Active filter:', filter)
  }

  return (
    <div>
      <GreetingHeader />
      <FilterTabs onFilterChange={handleFilterChange} />
      <TotalSpendCard amount={demoData.totalSpend} />
      <BudgetProgressBar
        spent={demoData.budget.spent}
        total={demoData.budget.total}
      />
      <TransactionList transactions={demoData.transactions} />
    </div>
  )
}

export default DemoDashboardPage
