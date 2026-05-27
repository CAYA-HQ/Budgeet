import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinancialContext";
import Layout from "./components/Layout";
import LandingPage from "./features/landing/LandingPage";
import DemoDashboardPage from "./features/demo/DemoDashboardPage";
import GoogleAuthCallback from "./features/auth/GoogleAuthCallback";
import DashboardPage from "./features/dashboard/DashboardPage";
import ExpensesPage from "./features/expenses/ExpensesPage";
import BudgetPage from "./features/budget/BudgetPage";
import InsightsPage from "./features/insights/InsightsPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import AuthLayout from "./components/layout/AuthLayout";
import SignIn from "./features/auth/SignIn";
import SignUp from "./features/auth/SignUp";
import ProfilePage from "./features/profile/ProfilePage"

/** Redirects unauthenticated users to /auth/signin */
 function PrivateRoute({ children }) {
   const { isAuthenticated } = useAuth();
   return isAuthenticated ? children : <Navigate to="/auth/signin" replace />;
 }

/** Redirects already-logged-in users away from auth pages */
 function PublicOnlyRoute({ children }) {
   const { isAuthenticated } = useAuth();
   return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="demo" element={<DemoDashboardPage />} />

      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route
        path="/auth"
        element={
          // <PublicOnlyRoute>
            <AuthLayout />
          // </PublicOnlyRoute>
        }
      >
        <Route index element={<SignIn />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>

      <Route path="auth/google/callback" element={<GoogleAuthCallback />} />

      <Route
        path="/dashboard"
        element={
          // <PrivateRoute>
            <FinanceProvider>
              <DashboardLayout />
            </FinanceProvider>
          // </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    // <AuthProvider>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;