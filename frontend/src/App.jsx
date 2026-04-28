import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './features/landing/LandingPage'
import IntroPage from './features/intro/IntroPage'
import AuthPage from './features/auth/AuthPage'
import DashboardPage from './features/dashboard/DashboardPage'
import ExpensesPage from './features/expenses/ExpensesPage'
import BudgetPage from './features/budget/BudgetPage'
import InsightsPage from './features/insights/InsightsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/insights" element={<InsightsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
