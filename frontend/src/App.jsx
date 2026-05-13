import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./features/landing/LandingPage";
import DemoDashboardPage from "./features/demo/DemoDashboardPage";
import AuthPage from "./features/auth/AuthPage";
import GoogleAuthCallback from "./features/auth/GoogleAuthCallback";
import DashboardPage from "./features/dashboard/DashboardPage";
import ExpensesPage from "./features/expenses/ExpensesPage";
import BudgetPage from "./features/budget/BudgetPage";
import InsightsPage from "./features/insights/InsightsPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import AuthLayout from "./components/layout/AuthLayout";
import SignIn from "./features/auth/SignIn";
import SignUp from "./features/auth/SignUp";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="demo" element={<DemoDashboardPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
        </Route>
        <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<SignIn />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
        <Route path="auth/google/callback" element={<GoogleAuthCallback />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
