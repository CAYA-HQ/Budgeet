import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './features/landing/LandingPage'
import DemoDashboardPage from './features/demo/DemoDashboardPage'
import AuthPage from './features/auth/AuthPage'
import DashboardPage from './features/dashboard/DashboardPage'
import ExpensesPage from './features/expenses/ExpensesPage'
import BudgetPage from './features/budget/BudgetPage'
import InsightsPage from './features/insights/InsightsPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo" element={<DemoDashboardPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
