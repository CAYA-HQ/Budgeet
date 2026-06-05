import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useFinance } from "../../context/FinancialContext";
import AddExpense from "../../components/AddExpense";
import AddIncome from "../../components/AddIncome";
import BottomNav from "../../components/BottomNav";
import { TrendingUp, TrendingDown } from "lucide-react";
import { financeApi } from "../../lib/api";
import { currentMonth, formatNaira } from "../../lib/utils";
import "../../styles/dashboard.css";

// Matches backend category ids exactly
const CATEGORY_COLORS = {
  food:          "#2563eb",
  bills:         "#06b6d4",
  family:        "#ec4899",
  healthcare:    "#10b981",
  fuel:          "#f59e0b",
  phone:         "#8b5cf6",
  education:     "#6366f1",
  entertainment: "#ef4444",
  shopping:      "#a855f7",
  travel:        "#3b82f6",
  socializing:   "#f97316",
  withdrawal:    "#6b7280",
  transfer:      "#14b8a6",
  transport:     "#eab308",
  housing:       "#6d28d9",
  miscellaneous: "#94a3b8",
};

// Build last N months as "YYYY-MM" strings
function getLastMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    months.push({ key: `${y}-${m}`, label: d.toLocaleString("en-NG", { month: "short" }) });
  }
  return months;
}

const TIME_RANGE_MONTHS = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };

function DashboardPage() {
  const {
    budget,
    expenses,
    incomes,
    totalSpent,
    totalIncome,
    fetchFinanceData,
    loadingFinance,
  } = useFinance();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome]   = useState(false);
  const [fabOpen, setFabOpen]               = useState(false);
  const [timeRange, setTimeRange]           = useState("6M");

  // ── Multi-month chart data ──
  const [chartData, setChartData]         = useState([]);
  const [loadingChart, setLoadingChart]   = useState(false);

  // ── Category breakdown for progress bars ──
  const [categoryData, setCategoryData]   = useState([]);

  useEffect(() => {
    fetchFinanceData(currentMonth());
    loadCategoryBreakdown();
  }, [fetchFinanceData]);

  // Reload chart when time range changes
  useEffect(() => {
    loadChartData(TIME_RANGE_MONTHS[timeRange]);
  }, [timeRange]);

  const loadChartData = async (numMonths) => {
    setLoadingChart(true);
    const months = getLastMonths(numMonths);
    try {
      const results = await Promise.all(
        months.map((m) => financeApi.getSummary(m.key).catch(() => null))
      );
      const data = months.map((m, i) => {
        const s = results[i];
        return {
          month:    m.label,
          income:   s ? Number(s.total_income) || 0 : 0,
          expenses: s ? Number(s.total_spent)  || 0 : 0,
        };
      });
      setChartData(data);
      // console.log(incomes)
    } catch {
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  const loadCategoryBreakdown = async () => {
    try {
      const data = await financeApi.getCategoryBreakdown(currentMonth());
      setCategoryData(data.categories || []);
    } catch {
      setCategoryData([]);
    }
  };

  // ── Category split for donut chart ──
  const realCategorySum = (expenses || []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0), 0
  );

  const categorySplitData = Object.values(
    (expenses || []).reduce((acc, item) => {
      const id = item.category || "miscellaneous";
      if (!acc[id]) {
        acc[id] = {
          name:  id.charAt(0).toUpperCase() + id.slice(1),
          value: 0,
          color: CATEGORY_COLORS[id] || CATEGORY_COLORS.miscellaneous,
        };
      }
      acc[id].value += Number(item.amount) || 0;
      return acc;
    }, {})
  )
    .map((item) => ({
      ...item,
      percentage: realCategorySum > 0
        ? Math.round((item.value / realCategorySum) * 100)
        : 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // ── Chart bar normalisation ──
  const maxChartValue = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expenses)), 1
  );

  // ── Budget progress — top 4 categories by spend ──
  const budgetProgressItems = categoryData.slice(0, 4).map((cat) => ({
    name:  cat.name,
    spent: cat.spent,
    total: budget?.amount
      ? Math.round(Number(budget.amount) / Math.max(categoryData.length, 1))
      : cat.spent * 1.5,
    color: CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.miscellaneous,
  }));

  // ── Income/expense trend badges ──
  const prevMonthKey = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  return (
    <div className="app-layout">
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />

      <div className="main-content px-6 py-8 max-w-7xl mx-auto space-y-6 w-full bg-slate-50/30">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        </div>

        {loadingFinance ? (
          <div className="loading-state text-center text-slate-500 py-12">
            Loading your finances…
          </div>
        ) : (
          <>
            {/* ── Summary cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Budget */}
              <div className="bg-blue-700 text-white p-6 rounded-2xl shadow-sm flex justify-between items-start relative overflow-hidden">
                <div className="space-y-4 z-10">
                  <span className="text-xs font-medium text-blue-200/90 block">Monthly Budget</span>
                  <span className="text-2xl font-bold tracking-tight block">
                    {formatNaira(budget?.amount || 0)}
                  </span>
                  <span className="text-xs text-blue-200 block">
                    {budget?.month || currentMonth()}
                  </span>
                </div>
                <div className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-bold text-green-300 z-10">
                  {budget?.amount ? "Active" : "Not set"}
                </div>
              </div>

              {/* Income */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-slate-400 block">Income</span>
                  <span className="text-2xl font-bold tracking-tight text-slate-900 block">
                    {formatNaira(incomes[0]?.amount || 0)}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {incomes[0]?.description}
                  </span>
                </div>
                <div className="px-2 py-1 bg-green-50 rounded-lg text-[10px] font-bold text-green-600 flex items-center gap-0.5">
                  <TrendingUp size={10} />
                </div>
              </div>

              {/* Expenses */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-slate-400 block">Total Expenses</span>
                  <span className="text-2xl font-bold tracking-tight text-slate-900 block">
                    {formatNaira(totalSpent || 0)}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    {expenses.length} {expenses.length === 1 ? "transaction" : "transactions"}
                  </span>
                </div>
                <div className="px-2 py-1 bg-red-50 rounded-lg text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                  <TrendingDown size={10} />
                </div>
              </div>
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Bar chart — real multi-month data */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Income vs Expenses</h3>
                    <p className="text-[11px] text-slate-400">Monthly comparison</p>
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

                {/* Legend */}
                <div className="flex gap-4 text-[10px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Income</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Expenses</span>
                </div>

                {loadingChart ? (
                  <div className="h-44 flex items-center justify-center text-slate-400 text-xs">Loading chart…</div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <div
                      className="flex items-end h-44 pt-4 px-2"
                      style={{
                        // Fixed bar+gap size so bars never scatter regardless of count
                        minWidth: chartData.length * 48,
                        gap: chartData.length > 6 ? 6 : 12,
                      }}
                    >
                      {chartData.map((bar, i) => {
                        const barW = chartData.length > 9 ? 10 : chartData.length > 6 ? 12 : 16;
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center flex-shrink-0 group"
                            style={{ gap: 6, width: barW * 2 + 6 }}
                          >
                            <div
                              className="flex items-end justify-center"
                              style={{ gap: 3, height: 128 }}
                            >
                              <div
                                className="bg-green-600 rounded-t-md transition-all group-hover:opacity-80"
                                style={{
                                  width: barW,
                                  height: `${maxChartValue > 0 ? (bar.income / maxChartValue) * 100 : 0}%`,
                                  minHeight: bar.income > 0 ? 4 : 0,
                                }}
                              />
                              <div
                                className="bg-red-500 rounded-t-md transition-all group-hover:opacity-80"
                                style={{
                                  width: barW,
                                  height: `${maxChartValue > 0 ? (bar.expenses / maxChartValue) * 100 : 0}%`,
                                  minHeight: bar.expenses > 0 ? 4 : 0,
                                }}
                              />
                            </div>
                            <span
                              className="font-semibold text-slate-400 text-center"
                              style={{ fontSize: chartData.length > 9 ? 9 : 11 }}
                            >
                              {bar.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Donut chart — real category split */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Category Split</h3>
                  <p className="text-[11px] text-slate-400">{categorySplitData.length} active categories</p>
                </div>

                {categorySplitData.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-8">
                    No expenses yet
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-4 py-2">
                    <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySplitData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={55}
                            paddingAngle={6}
                            cornerRadius={5}
                            dataKey="value"
                          >
                            {categorySplitData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-extrabold text-slate-800">
                          {formatNaira(totalSpent || 0)}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 mt-0.5">Total</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1 w-full max-h-[140px] overflow-y-auto pr-1">
                      {categorySplitData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full block flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate text-slate-600">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-800 ml-2">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Transactions + Budget progress ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent transactions — real expenses */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
                    <p className="text-[11px] text-slate-400">Latest expenses</p>
                  </div>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] py-1.5 px-3 rounded-lg shadow-sm transition-all"
                  >
                    + Add Expense
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <th className="pb-2">Description</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                      {expenses.length > 0 ? (
                        expenses.slice(0, 5).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 font-semibold text-slate-800">{item.label}</td>
                            <td className="py-3">
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.miscellaneous }}
                                />
                                <span className="text-slate-400 capitalize">{item.category}</span>
                              </span>
                            </td>
                            <td className="py-3 font-bold text-slate-800">{formatNaira(item.amount)}</td>
                            <td className="py-3 text-slate-400">{item.date}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                            No expenses logged yet. Click "+ Add Expense" to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Budget progress — real category data */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Budget Progress</h3>
                    <p className="text-[11px] text-slate-400">
                      {categoryData.length} active {categoryData.length === 1 ? "category" : "categories"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 flex-1 justify-center flex flex-col">
                  {budgetProgressItems.length > 0 ? (
                    budgetProgressItems.map((cat, idx) => {
                      const pct = Math.min(Math.round((cat.spent / cat.total) * 100), 100);
                      const isOver = cat.spent > cat.total;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span className="text-slate-800 font-semibold truncate max-w-[120px]">{cat.name}</span>
                            <span className={isOver ? "text-red-500" : "text-slate-500"}>
                              {formatNaira(cat.spent, { compact: true })}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: isOver ? "#ef4444" : cat.color,
                              }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 text-right">{pct}% used</div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Add expenses to see budget progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={() => { setFabOpen(false); setShowAddExpense(true); }}
        onAddIncome={() => { setFabOpen(false); setShowAddIncome(true); }}
      />

      {showAddExpense && (
        <AddExpense
          onClose={() => {
            setShowAddExpense(false);
            fetchFinanceData(currentMonth());
            loadCategoryBreakdown();
          }}
        />
      )}
      {showAddIncome && (
        <AddIncome
          onClose={() => {
            setShowAddIncome(false);
            fetchFinanceData(currentMonth());
            // toast.success("Income added");
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;