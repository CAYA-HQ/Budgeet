import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinancialContext";
import Layout from "./components/Layout";
import LandingPage from "./features/landing/LandingPage";
import DemoDashboardPage from "./features/demo/DemoDashboardPage";
import AuthLayout from "./components/layout/AuthLayout";
import SignIn from "./features/auth/SignIn";
import SignUp from "./features/auth/SignUp";
import GoogleAuthCallback from "./features/auth/GoogleAuthCallback";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./features/dashboard/DashboardPage";
import ExpensesPage from "./features/expenses/ExpensesPage";
import BudgetPage from "./features/budget/BudgetPage";
import InsightsPage from "./features/insights/InsightsPage";
<<<<<<< Updated upstream
import DashboardLayout from "./components/layout/DashboardLayout";
=======

/** Redirects unauthenticated users to /auth/login */
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
}

/** Redirects already-authenticated users away from auth pages */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route path="/demo" element={<DemoDashboardPage />} />

      {/* Auth — redirect to dashboard if already logged in */}
      <Route
        path="/auth"
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<SignIn />} />
        <Route path="register" element={<SignUp />} />
        {/* Legacy aliases */}
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>

      {/* Google OAuth callback — no auth guard needed */}
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />

      {/* Protected dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <FinanceProvider>
              <DashboardLayout />
            </FinanceProvider>
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="insights" element={<InsightsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
>>>>>>> Stashed changes

function App() {
  return (
    <BrowserRouter>
<<<<<<< Updated upstream
      <Routes>
        {/* Public Routes using standard Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="demo" element={<DemoDashboardPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="auth/google/callback" element={<GoogleAuthCallback />} />
        </Route>

        {/* Dashboard Routes using DashboardLayout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>
      </Routes>
=======
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
>>>>>>> Stashed changes
    </BrowserRouter>
  );
}

export default App;
