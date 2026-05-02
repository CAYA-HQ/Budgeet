function BudgetProgressBar({ spent, total, onTap }) {
  const percentage = total ? Math.round((spent / total) * 100) : 0

  const getColor = () => {
    if (percentage < 50) return 'green'
    if (percentage < 80) return 'yellow'
    return 'red'
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  if (!total) {
    return (
      <div className="budget-progress-bar" onClick={onTap} style={{ cursor: 'pointer' }}>
        <p className="budget-not-set">Tap to set a budget</p>
      </div>
    )
  }

  return (
    <div className="budget-progress-bar" onClick={onTap} style={{ cursor: 'pointer' }}>
      <p className="budget-label">Monthly Budget</p>
      <div className="budget-bar-track">
        <div
          className={`budget-bar-fill ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="budget-bar-details">
        <p>{formatAmount(spent)} spent of {formatAmount(total)}</p>
        <p>{formatAmount(total - spent)} remaining</p>
      </div>
    </div>
  )
}

export default BudgetProgressBar