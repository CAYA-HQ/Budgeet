import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./features/landing/LandingPage";
import DemoDashboardPage from "./features/demo/DemoDashboardPage";
import AuthPage from "./features/auth/AuthPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import ExpensesPage from "./features/expenses/ExpensesPage";
import BudgetPage from "./features/budget/BudgetPage";
import InsightsPage from "./features/insights/InsightsPage";
import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes using standard Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="demo" element={<DemoDashboardPage />} />
          <Route path="auth" element={<AuthPage />} />
        </Route>

        {/* Dashboard Routes using DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
