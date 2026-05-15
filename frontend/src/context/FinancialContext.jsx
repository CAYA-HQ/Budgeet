import { createContext, useContext, useState, useCallback } from "react";
import { financeApi } from "../lib/api";
import { currentMonth } from "../lib/utils";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loadingFinance, setLoadingFinance] = useState(false);

  const remaining =
    budget?.amount != null ? Number(budget.amount) - totalSpent : null;

  /** Fetch everything for a given month (default = current). */
  const fetchFinanceData = useCallback(async (month = currentMonth()) => {
    setLoadingFinance(true);
    try {
      const [expData, incData] = await Promise.all([
        financeApi.getExpenses(month),
        financeApi.getIncomes(month),
      ]);
      setBudget(expData.budget);
      setExpenses(expData.expenses || []);
      setTotalSpent(Number(expData.total_spent) || 0);
      setIncomes(incData.incomes || []);
      setTotalIncome(Number(incData.total_income) || 0);
    } catch (err) {
      console.error("Failed to load finance data:", err.message);
    } finally {
      setLoadingFinance(false);
    }
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        budget,
        expenses,
        incomes,
        totalSpent,
        totalIncome,
        remaining,
        loadingFinance,
        fetchFinanceData,
        // Optimistic local setters (used after successful API calls)
        setBudget,
        setExpenses,
        setIncomes,
        setTotalSpent,
        setTotalIncome,
      }}
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
