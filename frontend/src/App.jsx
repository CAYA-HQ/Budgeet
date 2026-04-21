import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './features/dashboard/DashboardPage'
import ExpensesPage from './features/expenses/ExpensesPage'
import BudgetPage from './features/budget/BudgetPage'
import InsightsPage from './features/insights/InsightsPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
