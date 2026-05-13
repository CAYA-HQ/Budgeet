// context/FinanceContext.jsx
import { createContext, useContext, useState } from "react";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const updateBudget = (amount) => setBudget(amount);

  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, expense]);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;

  return (
    <FinanceContext.Provider
      value={{ budget, expenses, updateBudget, addExpense, totalSpent, remaining }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used inside FinanceProvider");
  return context;
}