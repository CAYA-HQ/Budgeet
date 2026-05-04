function SpendingChart({ transactions }) {
  const expenses = transactions.filter((t) => t.type === 'expense')

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getDayIndex = (dateStr) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    return day === 0 ? 6 : day - 1
  }

  const dailyTotals = Array(7).fill(0)
  expenses.forEach((t) => {
    const dayIndex = getDayIndex(t.date)
    dailyTotals[dayIndex] += t.amount
  })

  const maxAmount = Math.max(...dailyTotals, 1)

  const formatAmount = (amount) => {
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}k`
    return `₦${amount}`
  }

  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1

  return (
    <div className="spending-chart">
      <h3 className="insights-section-title">This Week</h3>
      <div className="chart-bars">
        {days.map((day, index) => {
          const amount = dailyTotals[index]
          const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0
          const isToday = index === todayIndex
          const isHighest = amount === maxAmount && amount > 0

          return (
            <div key={day} className="chart-bar-wrapper">
              {amount > 0 && (
                <span className="chart-bar-amount">{formatAmount(amount)}</span>
              )}
              <div className="chart-bar-track">
                <div
                  className={`chart-bar-fill ${isHighest ? 'highest' : ''} ${isToday ? 'today' : ''}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className={`chart-bar-label ${isToday ? 'today' : ''}`}>{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SpendingChart