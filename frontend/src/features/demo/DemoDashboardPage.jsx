import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  TrendingDown, TrendingUp, Search, Bell, Plus, X,
  Home, Receipt, Wallet, ChevronDown, Moon, Sun,
  ShoppingCart, Car, ShoppingBag, Pill, Package,
  UtensilsCrossed, Zap, Pencil, ArrowUpRight,
} from 'lucide-react'

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_EXPENSES = [
  { id: 1, label: 'Chicken Republic', category: 'food',       amount: 10000, date: '2026-06-04' },
  { id: 2, label: 'Uber',             category: 'transport',  amount: 5000,  date: '2026-06-04' },
  { id: 3, label: 'Zara',             category: 'shopping',   amount: 25000, date: '2026-06-03' },
  { id: 4, label: 'Pharmacy',         category: 'healthcare', amount: 3400,  date: '2026-06-03' },
  { id: 5, label: 'Rent',             category: 'housing',    amount: 50000, date: '2026-06-02' },
]
const DEMO_INCOME  = 2000000
const DEMO_BUDGET  = 1500000
const TIMINGS      = [1000, 2200, 3400, 4600, 5800]

const CAT_COLORS = {
  food: '#22c55e', transport: '#eab308', shopping: '#a855f7',
  healthcare: '#10b981', housing: '#6d28d9',
}
const CAT_ICONS = {
  food:       <UtensilsCrossed size={16} />,
  transport:  <Car             size={16} />,
  shopping:   <ShoppingBag     size={16} />,
  healthcare: <Pill            size={16} />,
  housing:    <Home            size={16} />,
}
const CAT_ICON_EL = (cat) => CAT_ICONS[cat] || <Package size={16} />

const MONTH_BARS = [
  { month: 'Jan', income: 0,       expenses: 0 },
  { month: 'Feb', income: 0,       expenses: 0 },
  { month: 'Mar', income: 0,       expenses: 0 },
  { month: 'Apr', income: 0,       expenses: 0 },
  { month: 'May', income: 0,       expenses: 0 },
  { month: 'Jun', income: 2000000, expenses: 0 },
]

function fmt(n) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 2,
  }).format(n ?? 0)
}

// ── Shared card shell ─────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff', borderRadius: 14,
    border: '1px solid #f0f0f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    padding: 18, ...style,
  }}>
    {children}
  </div>
)

// ── Pages ─────────────────────────────────────────────────────────────────────

function DashboardView({ visible, totalSpent }) {
  const remaining = DEMO_BUDGET - totalSpent
  const maxBar = Math.max(...MONTH_BARS.map(b => Math.max(b.income, b.expenses)), totalSpent, 1)
  const bars = MONTH_BARS.map((b, i) =>
    i === 5 ? { ...b, expenses: totalSpent } : b
  )

  const catSplit = Object.values(
    visible.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = { name: e.category, value: 0, color: CAT_COLORS[e.category] || '#94a3b8' }
      acc[e.category].value += e.amount
      return acc
    }, {})
  ).map(c => ({ ...c, pct: totalSpent > 0 ? Math.round((c.value / totalSpent) * 100) : 0 }))
   .sort((a, b) => b.value - a.value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Dashboard</h1>

      {/* 3 summary cards */}
      <div className="demo-grid-3">
        {/* Budget — blue */}
        <div style={{
          background: '#1a35e8', borderRadius: 16, padding: 24, color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(26,53,232,0.25)',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 500 }}>Monthly Budget</p>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#86efac', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>Active</span>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '10px 0 4px', letterSpacing: '-0.5px' }}>{fmt(DEMO_BUDGET)}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>2026-06</p>
        </div>

        {/* Income */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: '#78778B', fontWeight: 500, margin: 0 }}>Total Income</p>
            <div style={{ width: 28, height: 28, background: '#f0fdf4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#22c55e" />
            </div>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>{fmt(DEMO_INCOME)}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>1 income entry</p>
        </Card>

        {/* Expenses */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 13, color: '#78778B', fontWeight: 500, margin: 0 }}>Total Expenses</p>
            <div style={{ width: 28, height: 28, background: '#fff5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={14} color="#ef4444" />
            </div>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '8px 0 4px', letterSpacing: '-0.5px' }}>{fmt(totalSpent)}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{visible.length} transaction{visible.length !== 1 ? 's' : ''}</p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="demo-grid-2">
        {/* Bar chart */}
        <Card style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Income vs Expenses</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Monthly comparison</p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: '#f5f5f5', borderRadius: 8, padding: 3 }}>
              {['1M','3M','6M','1Y'].map(t => (
                <button key={t} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: t === '6M' ? '#fff' : 'transparent',
                  color: t === '6M' ? '#1a35e8' : '#94a3b8',
                  fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                  boxShadow: t === '6M' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> Income
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> Expenses
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, paddingBottom: 20, position: 'relative' }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 112, justifyContent: 'center' }}>
                  <div style={{
                    width: 10, background: '#22c55e', borderRadius: '4px 4px 0 0',
                    height: b.income > 0 ? `${Math.round((b.income / maxBar) * 100)}%` : 2,
                    minHeight: 2, transition: 'height 0.7s ease',
                  }} />
                  <div style={{
                    width: 10, background: '#ef4444', borderRadius: '4px 4px 0 0',
                    height: b.expenses > 0 ? `${Math.round((b.expenses / maxBar) * 100)}%` : 2,
                    minHeight: 2, transition: 'height 0.7s ease',
                  }} />
                </div>
                <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{b.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Donut */}
        <Card>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>Category Split</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>{catSplit.length} active categories</p>
          {catSplit.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#c0bfce', padding: '32px 0', fontSize: 12 }}>No expenses yet</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catSplit} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value">
                      {catSplit.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#111' }}>{fmt(totalSpent)}</span>
                  <span style={{ fontSize: 7, color: '#94a3b8' }}>Total</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {catSplit.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ color: '#555', textTransform: 'capitalize' }}>{item.name}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: '#111' }}>{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Recent Transactions</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Latest expenses</p>
          </div>
        </div>
        {visible.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#c0bfce', fontSize: 12, padding: '24px 0' }}>Transactions appearing shortly…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: 400, borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
                {['Description','Category','Amount','Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', paddingBottom: 10, fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #fafafa', animation: 'rowIn 0.3s ease' }}>
                  <td style={{ padding: '11px 0', fontWeight: 600, color: '#111' }}>{item.label}</td>
                  <td style={{ padding: '11px 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: CAT_COLORS[item.category] || '#94a3b8' }} />
                      <span style={{ color: '#78778B', textTransform: 'capitalize' }}>{item.category}</span>
                    </span>
                  </td>
                  <td style={{ padding: '11px 0', fontWeight: 700, color: '#ef4444' }}>−{fmt(item.amount)}</td>
                  <td style={{ padding: '11px 0', color: '#94a3b8' }}>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </Card>
    </div>
  )
}

function ExpensesView({ visible, totalSpent }) {
  const [filter, setFilter] = useState('This Year')
  const biggest = visible.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, null)
  const avg = visible.length > 0 ? Math.round(totalSpent / visible.length) : 0

  const catBreakdown = Object.values(
    visible.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = { name: e.category, value: 0, color: CAT_COLORS[e.category] || '#94a3b8' }
      acc[e.category].value += e.amount
      return acc
    }, {})
  ).sort((a, b) => b.value - a.value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Expenses</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 10, padding: 3, gap: 2 }}>
            {['This week','This Month','This Year'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: filter === f ? '#1a35e8' : 'transparent',
                color: filter === f ? '#fff' : '#78778B',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>{f}</button>
            ))}
          </div>
          <button style={{
            background: '#1a35e8', color: '#fff', border: 'none', borderRadius: 10,
            padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: '#78778B', fontWeight: 500, margin: 0 }}>Total Spent/Year</p>
            <div style={{ width: 28, height: 28, background: '#fff5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={14} color="#ef4444" />
            </div>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '8px 0 4px' }}>{fmt(totalSpent)}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{visible.length} transactions</p>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: '#78778B', fontWeight: 500, margin: 0 }}>Avg/transaction</p>
            <div style={{ width: 28, height: 28, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={14} color="#3b82f6" />
            </div>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '8px 0 4px' }}>{fmt(avg)}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Across selected range</p>
        </Card>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 12, color: '#78778B', fontWeight: 500, margin: 0 }}>Biggest expense</p>
            <div style={{ width: 28, height: 28, background: '#fefce8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={14} color="#eab308" />
            </div>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: '8px 0 4px' }}>{fmt(biggest?.amount || 0)}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{biggest?.label || '—'}</p>
        </Card>
      </div>

      {/* Spending by category */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Spending by category</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Last 12 months</p>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{fmt(totalSpent)}</span>
        </div>
        {catBreakdown.length === 0 ? (
          <p style={{ color: '#c0bfce', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No expenses yet</p>
        ) : catBreakdown.map((cat, i) => {
          const pct = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: cat.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cat.color,
                  }}>
                    {CAT_ICON_EL(cat.name)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0, textTransform: 'capitalize' }}>{cat.name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{pct}% of total spend</p>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{fmt(cat.value)}</span>
              </div>
              <div style={{ background: '#f1f5f9', height: 6, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 99, transition: 'width 0.7s ease' }} />
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

function BudgetView({ visible, totalSpent }) {
  const remaining = DEMO_BUDGET - totalSpent
  const catBreakdown = Object.values(
    visible.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = { name: e.category, value: 0 }
      acc[e.category].value += e.amount
      return acc
    }, {})
  ).sort((a, b) => b.value - a.value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0 }}>Budgets</h1>
        <button style={{
          background: '#1a35e8', color: '#fff', border: 'none', borderRadius: 10,
          padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>+ New budget</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        <Card>
          <p style={{ fontSize: 12, color: '#78778B', fontWeight: 500, margin: '0 0 10px' }}>Total Budget</p>
          <p style={{ fontSize: 21, fontWeight: 800, color: '#111', margin: 0 }}>{fmt(DEMO_BUDGET)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: 12, color: '#78778B', fontWeight: 500, margin: '0 0 10px' }}>Spent</p>
          <p style={{ fontSize: 21, fontWeight: 800, color: '#ef4444', margin: 0 }}>{fmt(totalSpent)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: 12, color: '#78778B', fontWeight: 500, margin: '0 0 10px' }}>Remaining</p>
          <p style={{ fontSize: 21, fontWeight: 800, color: '#22c55e', margin: 0 }}>{fmt(Math.max(remaining, 0))}</p>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Categories</p>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{catBreakdown.length} active {catBreakdown.length === 1 ? 'category' : 'categories'}</p>
        </div>
        {catBreakdown.length === 0 ? (
          <p style={{ color: '#c0bfce', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Add expenses to see categories</p>
        ) : (
          <div className="demo-grid-cats">
            {catBreakdown.map((cat, i) => {
              const pct = Math.min(Math.round((cat.value / DEMO_BUDGET) * 100), 100)
              const color = CAT_COLORS[cat.name] || '#94a3b8'
              return (
                <div key={i} style={{
                  border: '1px solid #f0f0f0', borderRadius: 14, padding: 16,
                  background: '#fafafa',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: color + '20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color,
                      }}>
                        {CAT_ICON_EL(cat.name)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0, textTransform: 'capitalize' }}>{cat.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{pct}% Used</p>
                      </div>
                    </div>
                    <Pencil size={13} color="#94a3b8" style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4, fontSize: 12, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: '#111' }}>{fmt(cat.value)}</span>
                    <span style={{ color: '#94a3b8' }}>/</span>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>{fmt(DEMO_BUDGET)}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: 5, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home',     icon: Home    },
  { id: 'expenses',  label: 'Expenses', icon: Receipt },
  { id: 'budget',    label: 'Budget',   icon: Wallet  },
]

export default function DemoDashboardPage() {
  const navigate = useNavigate()
  const [visible, setVisible]       = useState([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [activeTab, setActiveTab]   = useState('dashboard')
  const [showCTA, setShowCTA]       = useState(false)
  const [fabOpen, setFabOpen]       = useState(false)

  useEffect(() => {
    const welcome = setTimeout(() => toast(' Watch Budgeet track spending live', {
      duration: 3000,
      style: { background: '#000', color: '#fff', fontSize: '13px', fontWeight: 600, borderRadius: '12px', padding: '10px 18px' },
    }), 800)

    const timers = DEMO_EXPENSES.map((e, i) =>
      setTimeout(() => {
        setVisible(prev => [e, ...prev])
        setTotalSpent(prev => prev + e.amount)
      }, TIMINGS[i])
    )

    const cta = setTimeout(() => setShowCTA(true), 8500)
    return () => { clearTimeout(welcome); clearTimeout(cta); timers.forEach(clearTimeout) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', fontFamily: "'Poppins', sans-serif" }}>
      <Toaster position="top-center" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes rowIn  { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideUp{ from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes fabPop { from { opacity:0; transform:scale(0.8) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        /* ── Mobile-first base styles ── */
        .demo-sidenav { display:none }
        .demo-search-full { display:none }
        .demo-search-icon { display:flex }
        .demo-avatar-text { display:none }
        .demo-add-income { display:none }
        .demo-bottom-nav { display:flex }
        .demo-main { margin-left:0; padding-bottom:88px }
        .demo-header { left:0; padding:0 16px }
        .demo-page-pad { padding:16px 14px 32px }
        .demo-sidenav-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; font-size:14px; font-weight:500; color:#78778B; cursor:pointer; text-decoration:none; border:none; background:none; width:100%; font-family:inherit; transition:all 0.15s; }
        .demo-sidenav-item:hover { background:#f5f5f5 }
        .demo-sidenav-item.active { background:#1a35e8; color:#fff; font-weight:700 }

        /* ── Responsive grids ── */
        .demo-grid-3 { display:grid; grid-template-columns:1fr; gap:12px }
        .demo-grid-2 { display:grid; grid-template-columns:1fr; gap:16px }
        .demo-grid-cats { display:grid; grid-template-columns:1fr; gap:12px }
        @media (min-width:640px) {
          .demo-grid-3 { grid-template-columns:repeat(3,1fr) !important; gap:16px !important }
          .demo-grid-2 { grid-template-columns:2fr 1fr !important }
          .demo-grid-cats { grid-template-columns:repeat(2,1fr) !important }
        }

        /* ── Desktop overrides (≥769px) ── */
        @media (min-width:769px) {
          .demo-sidenav { display:flex !important }
          .demo-search-full { display:flex !important }
          .demo-search-icon { display:none !important }
          .demo-avatar-text { display:block !important }
          .demo-add-income { display:flex !important }
          .demo-bottom-nav { display:none !important }
          .demo-main { margin-left:220px !important; padding-bottom:0 !important }
          .demo-header { left:220px !important; padding:0 24px !important }
          .demo-page-pad { padding:28px 28px 40px !important }
        }

        @media(max-width:640px){

        table{
        min-width:100% !important;
        }

        thead{
        display:none;
        }

        tbody tr{
        display:flex;
        flex-direction:column;

        padding:12px;

        margin-bottom:12px;

        border-radius:12px;

        background:white;
        }

        tbody td{
        display:flex;

        justify-content:space-between;

        padding:6px 0 !important;
        }

        }

        button{
          flex-shrink:0;
        }
      `}</style>

      {/* ── Desktop Sidebar ── */}
      <div className="demo-sidenav" style={{
        width: 220, background: '#fff', borderRight: '1px solid #f0f0f0',
        flexDirection: 'column', padding: '24px 16px',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 32, padding: '0 4px' }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#1a35e8,#3347e8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>B</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.3px' }}>Budgeet</span>
        </div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`demo-sidenav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Main area ── */}
      <div
          className="demo-main"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            minWidth: 0,
          }}
        >
        {/* Header */}
        <div
          className="demo-header"
          style={{
          position:'sticky',
          top:0,
          zIndex:99,
          background:'#fff',
          borderBottom:'1px solid #f0f0f0',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          height:64,
          boxShadow:'0 1px 6px rgba(0,0,0,.04)',

          width:'100%',
          maxWidth:'100%',
          padding:'0 16px',
          }}
          >
          {/* Search — desktop */}
          <div className="demo-search-full" style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#f8f9ff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
            <input
              readOnly
              placeholder="Search expenses, income..."
              style={{ background: 'transparent', border: 'none', outline: 'none', padding: '8px 14px', fontSize: 13, color: '#555', fontFamily: 'inherit', width: 220 }}
            />
            <button style={{ padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#78778B' }}>
              <Search size={16} />
            </button>
          </div>

          {/* Search icon — mobile only */}
          <button className="demo-search-icon" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#78778B' }}>
            <Search size={22} />
          </button>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#78778B" />
              {visible.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700,
                  width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{visible.length}</span>
              )}
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a35e8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>C</div>
              <div className="demo-avatar-text" style={{ lineHeight: 1.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Moon size={10} color="#78778B" />
                  <span style={{ fontSize: 10, color: '#78778B', fontWeight: 500 }}>Good night</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Christopher</span>
                  <ChevronDown size={13} color="#78778B" />
                </div>
              </div>
            </div>

            {/* Add Income CTA */}
            <button className="demo-add-income"
              onClick={() => navigate('/auth/signup')}
              style={{
                background: '#1a35e8', color: '#fff', border: 'none', borderRadius: 10,
                padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={14} /> Add Income
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="demo-page-pad" style={{ flex: 1, padding: '28px 28px 40px', maxWidth: 1100, width: '100%' }}>
          {activeTab === 'dashboard' && <DashboardView visible={visible} totalSpent={totalSpent} />}
          {activeTab === 'expenses'  && <ExpensesView  visible={visible} totalSpent={totalSpent} />}
          {activeTab === 'budget'    && <BudgetView    visible={visible} totalSpent={totalSpent} />}
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="demo-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#fff', borderTop: '1px solid #f0f0f0',
        flexDirection: 'row', alignItems: 'center',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
          {/* Home */}
        <button onClick={() => setActiveTab('dashboard')} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '10px 0',
          border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
          color: activeTab === 'dashboard' ? '#1a35e8' : '#94a3b8',
          fontSize: 10, fontWeight: activeTab === 'dashboard' ? 700 : 500,
        }}>
          <Home size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 1.8} />
          Home
        </button>

        {/* FAB — centre */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {fabOpen && (
            <div style={{
              position: 'absolute', bottom: 68, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', gap: 8,
              animation: 'fabPop 0.2s ease', zIndex: 10,
            }}>
              {[
                { label: 'Add Income',  icon: <Wallet size={15} color="#1a35e8" /> },
                { label: 'Add Expense', icon: <Receipt size={15} color="#ef4444" /> },
              ].map(opt => (
                <button key={opt.label} onClick={() => { setFabOpen(false); navigate('/auth/signup') }} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px',
                  borderRadius: 14, border: 'none', background: '#fff', fontWeight: 600,
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.14)', whiteSpace: 'nowrap', color: '#111',
                }}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setFabOpen(v => !v)} style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg,#1a35e8,#3347e8)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,53,232,0.45)',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            marginBottom: 8,
          }}>
            {fabOpen ? <X size={22} /> : <Plus size={22} />}
          </button>
        </div>

        {/* Budget */}
        <button onClick={() => setActiveTab('budget')} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 3, padding: '10px 0',
          border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
          color: activeTab === 'budget' ? '#1a35e8' : '#94a3b8',
          fontSize: 10, fontWeight: activeTab === 'budget' ? 700 : 500,
        }}>
          <Wallet size={20} strokeWidth={activeTab === 'budget' ? 2.5 : 1.8} />
          Budget
        </button>
      </div>

      {/* ── Soft CTA banner ── */}
      {showCTA && (
        <div
          style={{
            position: 'fixed', left: 16, right: 16, 
            bottom: 'calc(84px + env(safe-area-inset-bottom))',
            background: '#fff',
            border: '1px solid #edf0ff',
            borderRadius: 20,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            box: '0 12px 40px rgba(26,53,232,.12)',
            zIndex: 300,
            animation:'slideUp .35s cubic-bezier(.16,1,.3,1)',
            maxWidth: 460,
            margin: '0 auto',
          }}
        >
          {/* Top */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background:'linear-gradient(135deg,#1a35e8,#3347e8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: '#fff',
                  fontSize: 18,
                }}
              >
                ✦
              </span>
            </div>

            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#111',
                }}
              >
                Like what you see?
              </p>

              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: '#78778B',
                }}
              >
                Track your spending and build better habits.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              width: '100%',
            }}
          >
            <button
              onClick={() => navigate('/auth/signup')}
              style={{
                flex: 1,
                height: 44,
                background:'linear-gradient(135deg,#1a35e8,#3347e8)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Start free
            </button>
            <button
              onClick={() => setShowCTA(false)}
              style={{
                minWidth: 88,
                height: 44,
                background: '#f7f8fc',
                color: '#666',
                border: '1px solid #ececec',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}