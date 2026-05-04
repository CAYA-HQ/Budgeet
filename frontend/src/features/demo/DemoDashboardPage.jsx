import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'
import GreetingHeader from '../../components/GreetingHeader'
import FilterTabs from '../../components/FilterTabs'
import TotalSpendCard from '../../components/TotalSpendCard'
import BudgetProgressBar from '../../components/BudgetProgressBar'
import TransactionList from '../../components/TransactionList'
import BottomNav from '../../components/BottomNav'
import SideNav from '../../components/SideNav'
import '../../styles/dashboard.css'

const expenseSequence = [
  { icon: 'food', name: 'Chicken Republic', time: '9:21 AM', amount: 2500, type: 'expense', date: new Date().toISOString().split('T')[0] },
  { icon: 'transport', name: 'Uber', time: '10:15 AM', amount: 1800, type: 'expense', date: new Date().toISOString().split('T')[0] },
  { icon: 'shopping', name: 'Zara', time: '11:30 AM', amount: 25000, type: 'expense', date: new Date().toISOString().split('T')[0] },
  { icon: 'healthcare', name: 'Pharmacy', time: '12:45 PM', amount: 3400, type: 'expense', date: new Date().toISOString().split('T')[0] },
  { icon: 'housing', name: 'Rent', time: '2:00 PM', amount: 12500, type: 'expense', date: new Date().toISOString().split('T')[0] },
]

const timings = [2000, 3500, 5000, 6500, 9000]

function DemoDashboardPage() {
  const navigate = useNavigate()
  const [fabOpen, setFabOpen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [totalSpend, setTotalSpend] = useState(0)
  const [budget, setBudget] = useState({ spent: 0, total: 50000 })
  const [showModal, setShowModal] = useState(false)
  const [animationDone, setAnimationDone] = useState(false)

  useEffect(() => {
    // Welcome toast
    const welcomeTimer = setTimeout(() => {
      toast('Welcome! See how Budgeet works 👀', {
        duration: 3000,
        style: {
          background: '#000000',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '12px 20px',
        },
      })
    }, 1000)

    // Add expenses one by one
    const expenseTimers = expenseSequence.map((expense, index) => {
      return setTimeout(() => {
        setTransactions((prev) => [...prev, expense])
        setTotalSpend((prev) => prev + expense.amount)
        setBudget((prev) => ({ ...prev, spent: prev.spent + expense.amount }))
      }, timings[index])
    })

    // Show modal after last expense
    const modalTimer = setTimeout(() => {
      setAnimationDone(true)
      setShowModal(true)
    }, 11000)

    return () => {
      clearTimeout(welcomeTimer)
      clearTimeout(modalTimer)
      expenseTimers.forEach(clearTimeout)
    }
  }, [])

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
        }}
      />
      <SideNav />
      <div className="main-content">
        <GreetingHeader />
        <FilterTabs onFilterChange={() => {}} />
        <TotalSpendCard amount={totalSpend} />
        <BudgetProgressBar
          spent={budget.spent}
          total={budget.total}
          onTap={() => {}}
        />
        <TransactionList
          transactions={transactions}
          onAddExpense={() => navigate('/auth')}
          onTapTransaction={() => {}}
        />
      </div>
      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => navigate('/auth')}
        onAddIncome={() => navigate('/auth')}
      />

      {showModal && (
        <div className="demo-modal-overlay">
          <div className="demo-modal">
            <h2>Ready to track your own spending? 🚀</h2>
            <p>You have seen how Budgeet works. Now create your account and start tracking your real expenses.</p>
            <button
              className="demo-modal-cta"
              onClick={() => navigate('/auth')}
            >
              Get Started — It is Free
            </button>
            <button
              className="demo-modal-secondary"
              onClick={() => setShowModal(false)}
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoDashboardPage