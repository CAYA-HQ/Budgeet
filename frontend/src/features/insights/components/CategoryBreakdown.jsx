import { Utensils, Car, ShoppingBag, Heart, Home, Tv, BookOpen, Package, Zap, Users, Fuel, Smartphone, Plane, Coffee, Landmark, ArrowLeftRight } from 'lucide-react'

const categoryConfig = {
  food: { label: 'Food', icon: Utensils },
  transport: { label: 'Transport', icon: Car },
  shopping: { label: 'Shopping', icon: ShoppingBag },
  healthcare: { label: 'Healthcare', icon: Heart },
  housing: { label: 'Housing', icon: Home },
  entertainment: { label: 'Entertainment', icon: Tv },
  education: { label: 'Education', icon: BookOpen },
  miscellaneous: { label: 'Miscellaneous', icon: Package },
  bills: { label: 'Bills/Utilities', icon: Zap },
  family: { label: 'Family', icon: Users },
  fuel: { label: 'Fuel', icon: Fuel },
  phone: { label: 'Phone/Internet', icon: Smartphone },
  travel: { label: 'Travel', icon: Plane },
  socializing: { label: 'Socializing', icon: Coffee },
  withdrawal: { label: 'Withdrawal', icon: Landmark },
  transfer: { label: 'Transfer', icon: ArrowLeftRight },
}

function CategoryBreakdown({ transactions }) {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const totalSpend = expenses.reduce((sum, t) => sum + t.amount, 0)

  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  if (sorted.length === 0) return null

  return (
    <div className="category-breakdown">
      <h3 className="insights-section-title">Spending by Category</h3>
      <div className="category-breakdown-list">
        {sorted.map(([category, amount], index) => {
          const config = categoryConfig[category] || { label: category, icon: Package }
          const Icon = config.icon
          const percentage = Math.round((amount / totalSpend) * 100)

          return (
            <div
              key={category}
              className="category-breakdown-item"
              style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
            >
              <div className="category-breakdown-row">
                <div className="category-breakdown-left">
                  <div className="category-breakdown-icon">
                    <Icon size={18} />
                  </div>
                  <span className="category-breakdown-label">{config.label}</span>
                </div>
                <div className="category-breakdown-right">
                  <span className="category-breakdown-amount">{formatAmount(amount)}</span>
                  <span className="category-breakdown-percentage">{percentage}%</span>
                </div>
              </div>
              <div className="category-breakdown-bar-track">
                <div
                  className="category-breakdown-bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryBreakdown