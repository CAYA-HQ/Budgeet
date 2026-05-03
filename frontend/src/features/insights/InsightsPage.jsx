import { useEffect, useState } from 'react'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'
import InsightCard from './components/InsightCard'
import CategoryBreakdown from './components/CategoryBreakdown'
import SpendingChart from './components/SpendingChart'
import '../../styles/dashboard.css'
import '../../styles/insights.css'

const mockTransactions = [
  { icon: 'food', name: 'Chicken Republic', time: '9:21 AM', amount: 2500, type: 'expense', date: new Date().toISOString().split('T')[0], category: 'food' },
  { icon: 'transport', name: 'Uber', time: '10:15 AM', amount: 1800, type: 'expense', date: new Date().toISOString().split('T')[0], category: 'transport' },
  { icon: 'shopping', name: 'Zara', time: '11:30 AM', amount: 25000, type: 'expense', date: new Date().toISOString().split('T')[0], category: 'shopping' },
  { icon: 'healthcare', name: 'Pharmacy', time: '12:45 PM', amount: 3400, type: 'expense', date: new Date().toISOString().split('T')[0], category: 'healthcare' },
  { icon: 'housing', name: 'Rent', time: '2:00 PM', amount: 12500, type: 'expense', date: new Date().toISOString().split('T')[0], category: 'housing' },
]

const mockBudget = { total: 50000, spent: 45000 }

function InsightsPage() {
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <div className="app-layout">
      <SideNav />
      <div className="main-content">
        <div className="insights-header">
          <h1>Insights</h1>
          <p>Here is what your spending says about you</p>
        </div>
        <InsightCard transactions={mockTransactions} budget={mockBudget} />
        <CategoryBreakdown transactions={mockTransactions} />
        <SpendingChart transactions={mockTransactions} />
      </div>
      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => {}}
        onAddIncome={() => {}}
      />
    </div>
  )
}

export default InsightsPage