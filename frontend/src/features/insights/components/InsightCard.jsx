import { Zap, Shield, Target, Star } from 'lucide-react'

function InsightCard({ transactions, budget }) {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const totalSpend = expenses.reduce((sum, t) => sum + t.amount, 0)

  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {})

  const categoryLabels = {
    food: 'Food', transport: 'Transport', shopping: 'Shopping',
    healthcare: 'Healthcare', housing: 'Housing', entertainment: 'Entertainment',
    education: 'Education', miscellaneous: 'Miscellaneous',
  }

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const budgetPercentage = budget.total ? Math.round((budget.spent / budget.total) * 100) : 0

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const insights = []

  if (topCategory) {
    insights.push({
      icon: Zap,
      iconBg: '#fff9e6',
      iconColor: '#f59e0b',
      title: 'Top Category',
      text: `${categoryLabels[topCategory[0]] || topCategory[0]} accounts for the largest share of your spending this month.`,
    })
  }

  if (budgetPercentage >= 80) {
    insights.push({
      icon: Shield,
      iconBg: '#fef2f2',
      iconColor: '#ef4444',
      title: 'Budget Alert',
      text: `You have used ${budgetPercentage}% of your monthly budget. Consider slowing down on non-essentials.`,
    })
  }

  if (budgetPercentage < 50 && budget.total) {
    insights.push({
      icon: Star,
      iconBg: '#f0fdf4',
      iconColor: '#22c55e',
      title: 'On Track',
      text: `You are managing your budget well this month. Keep maintaining this discipline.`,
    })
  }

  if (expenses.length > 0) {
    insights.push({
      icon: Target,
      iconBg: '#f5f5f5',
      iconColor: '#000000',
      title: 'Activity',
      text: `You have logged ${expenses.length} expense${expenses.length !== 1 ? 's' : ''} totalling ${formatAmount(totalSpend)} this period.`,
    })
  }

  return (
    <div className="insight-cards">
      {insights.map((insight, index) => {
        const Icon = insight.icon
        return (
          <div key={index} className="insight-card">
            <div
              className="insight-card-icon"
              style={{
                backgroundColor: insight.iconBg,
                color: insight.iconColor,
              }}
            >
              <Icon size={18} />
            </div>
            <div className="insight-card-content">
              <p className="insight-card-title">{insight.title}</p>
              <p className="insight-card-text">{insight.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default InsightCard