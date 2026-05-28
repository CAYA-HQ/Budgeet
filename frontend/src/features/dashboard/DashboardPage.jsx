import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useFinance } from "../../context/FinancialContext";
import AddExpense from "../../components/AddExpense";
import AddIncome from "../../components/AddIncome";
import BottomNav from "../../components/BottomNav";
import { TrendingUp, TrendingDown } from "lucide-react";
import { currentMonth, formatNaira } from "../../lib/utils";
import "../../styles/dashboard.css";

// Definitive identifiable color registry for all real backend categories
const CATEGORY_COLORS = {
  "food": "#2563eb",           // Blue
  "bills/utilities": "#06b6d4", // Cyan
  "family": "#ec4899",          // Pink
  "healthcare": "#10b981",      // Emerald Green
  "fuel": "#f59e0b",            // Amber/Gold
  "phone/internet": "#8b5cf6",  // Purple
  "education": "#6366f1",       // Indigo
  "entertainment": "#ef4444",   // Red
  "shopping": "#a855f7",        // Light Purple
  "travel": "#3b82f6",          // Sky Blue
  "socializing": "#f97316",     // Orange
  "withdrawal": "#6b7280",      // Slate Gray
  "transfer": "#14b8a6",        // Teal
  "transportation": "#eab308",  // Yellow
  "housing": "#6d28d9",         // Deep Violet
  "miscellaneous": "#94a3b8"    // Muted Slate
};

function DashboardPage() {
  const {
    budget,
    expenses,
    incomes,
    totalSpent,
    fetchFinanceData,
    loadingFinance,
  } = useFinance();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("6M");

  useEffect(() => {
    fetchFinanceData(currentMonth());
  }, [fetchFinanceData]);

  const mockBarChartData = [
    { month: "Jan", income: 100, expenses: 65 },
    { month: "Feb", income: 95, expenses: 75 },
    { month: "Mar", income: 110, expenses: 80 },
    { month: "Apr", income: 105, expenses: 85 },
  ];


  // Comprehensive mapping layer normalizing your real category list to chart colors
  const realCategorySum = (expenses || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const groupedExpensesMap = (expenses || []).reduce((acc, item) => {
    const rawCategory = item.category || "Miscellaneous";

    // Normalize string key to safely lookup hex color strings from registry
    let lookupKey = rawCategory.toLowerCase().trim();
    if (lookupKey === "bills/utilities") lookupKey = "bills and utilities";
    if (lookupKey === "phone/internet") lookupKey = "phone/internet";
    if (
      lookupKey === "fuel" ||
      lookupKey === "travel" ||
      lookupKey === "transportation"
    )
      lookupKey = "transport";

    if (!acc[rawCategory]) {
      acc[rawCategory] = {
        name: rawCategory,
        value: 0,
        color: CATEGORY_COLORS[lookupKey] || CATEGORY_COLORS["miscellaneous"],
      };
    }
    acc[rawCategory].value += Number(item.amount) || 0;
    return acc;
  }, {});

  // Generate the unified structured array for both Pie chart and Legend loops
  const categorySplitData = Object.values(groupedExpensesMap)
    .map((item) => ({
      ...item,
      percentage:
        realCategorySum > 0
          ? Math.round((item.value / realCategorySum) * 100)
          : 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />

      <div className="main-content px-6 py-8 max-w-7xl mx-auto space-y-6 w-full bg-slate-50/30">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        {loadingFinance ? (
          <div className="loading-state text-center text-slate-500 py-12">
            Gathering analytics pipeline...
          </div>
        ) : (
          <>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-700 text-white p-6 rounded-2xl shadow-sm flex justify-between items-start relative overflow-hidden">
                <div className="space-y-4 z-10">
                  <span className="text-xs font-medium text-blue-200/90 block">
                    Budget
                  </span>
                  <span className="text-2xl font-bold tracking-tight block">
                    {formatNaira(budget?.amount || 0.0)}
                  </span>
                </div>
                <div className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-bold text-green-300 flex items-center gap-0.5 z-10">
                  ▲ 8.4%
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Income (April)
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-slate-900 block">
                    {formatNaira(incomes || 0.00)}
                  </span>
                </div>
                <div className="px-2 py-1 bg-green-50 rounded-lg text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                  <TrendingUp /> 5.2%
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Total Expenses
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-slate-900 block">
                    {formatNaira(totalSpent || 92100)}
                  </span>
                </div>
                <div className="px-2 py-1 bg-red-50 rounded-lg text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                  <TrendingDown /> 3.1%
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Canvas Panel: Income vs Expenses Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Income vs Expenses
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Last 4 months (thousands)
                    </p>
                  </div>
                  <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1 text-[10px] font-bold text-slate-500">
                    {["1M", "3M", "6M", "1Y"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`px-2.5 py-1 rounded-md transition-all ${timeRange === t ? "bg-white text-blue-600 shadow-sm" : ""}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end justify-between h-44 pt-4 px-2">
                  {mockBarChartData.map((bar, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 flex-1 group"
                    >
                      <div className="flex gap-1.5 items-end justify-center w-full h-32">
                        <div
                          className="w-4 sm:w-6 bg-green-600 rounded-t-md transition-all group-hover:opacity-90"
                          style={{ height: `${bar.income}%` }}
                        />
                        <div
                          className="w-4 sm:w-6 bg-red-600 rounded-t-md transition-all group-hover:opacity-90"
                          style={{ height: `${bar.expenses}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
           
        
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Category Split</h3>
                  <p className="text-[11px] text-slate-400">All Active Categories</p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-4 py-2">
                  
                  {/* RECHARTS PIE/DONUT GRAPH */}
                  <div className="relative w-35 h-35 flex-shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySplitData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={50}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categorySplitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

       
                    <div className="absolute text-center pointer-events-none">
                      <span className="text-xs font-extrabold text-slate-800 block">
                        {formatNaira(totalSpent || realCategorySum || 0, { notation: 'compact' })}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 block mt-0.5">Total Spend</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 w-full max-h-[140px] overflow-y-auto pr-1">
                    {categorySplitData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-2 truncate">
                          <span 
                            className="w-2 h-2 rounded-full block flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 ml-2">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Recent transactions
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Latest 5 movements across accounts
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] py-1.5 px-3 rounded-lg shadow-sm transition-all"
                  >
                    + Add expenses
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-50">
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                      {(expenses?.slice(0, 3) || []).length > 0 ? (
                        expenses.slice(0, 3).map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-3 font-semibold text-slate-800">
                              {item.label}
                            </td>
                            <td className="py-3 text-slate-400">
                              {item.category}
                            </td>
                            <td className="py-3 font-bold">
                              {formatNaira(item.amount)}
                            </td>
                            <td className="py-3 text-slate-400">
                              {item.date || "Today"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="border-b border-slate-50">
                            <td className="py-3 flex items-center gap-2.5 font-bold text-slate-800">
                              <span className="p-1 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                                📱
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs">
                                  Iphone 13 Pro MAX
                                </span>
                                <span className="text-[9px] text-slate-400 font-normal">
                                  Apple Inc.
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-400">Mobile</td>
                            <td className="py-3 font-bold text-slate-800">
                              420.84
                            </td>
                            <td className="py-3 text-slate-400">14 Apr 2022</td>
                          </tr>
                          <tr className="border-b border-slate-50">
                            <td className="py-3 flex items-center gap-2.5 font-bold text-slate-800">
                              <span className="p-1 bg-slate-50 border border-slate-100 rounded-lg text-sm">
                                🎬
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs">
                                  Netflix Subscription
                                </span>
                                <span className="text-[9px] text-slate-400 font-normal">
                                  Netflix
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-slate-400">
                              Entertainment
                            </td>
                            <td className="py-3 font-bold text-slate-800">
                              $100.00
                            </td>
                            <td className="py-3 text-slate-400">05 Apr 2022</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Action Box: Budget Progress Slider Track List Widget */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Budget progress
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      April 4 of 8 categories
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-all">
                    View all
                  </button>
                </div>

                <div className="space-y-4 flex-1 justify-center flex flex-col">
                  {[
                    {
                      name: "Food and Groceries",
                      spent: 42000,
                      total: 60000,
                      color: "bg-blue-600",
                    },
                    {
                      name: "Transport",
                      spent: 28000,
                      total: 30000,
                      color: "bg-orange-500",
                    },
                    {
                      name: "Entertainment",
                      spent: 18500,
                      total: 15000,
                      color: "bg-red-500",
                    },
                  ].map((budget, itemIdx) => {
                    const progressPercent = Math.min(
                      Math.round((budget.spent / budget.total) * 100),
                      100,
                    );
                    return (
                      <div key={itemIdx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-slate-700">
                          <span className="text-slate-800 font-semibold">
                            {budget.name}
                          </span>
                          <span>
                            {budget.spent.toLocaleString()} /{" "}
                            {budget.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${budget.color}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => {
          setFabOpen(false);
          setShowAddExpense(true);
        }}
        onAddIncome={() => {
          setFabOpen(false);
          setShowAddIncome(true);
        }}
      />

      {showAddExpense && (
        <AddExpense
          onClose={() => {
            setShowAddExpense(false);
            toast.success("Expense registered");
          }}
        />
      )}
      {showAddIncome && (
        <AddIncome
          onClose={() => {
            setShowAddIncome(false);
            toast.success("Income registered");
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;
