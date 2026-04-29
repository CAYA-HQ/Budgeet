function TotalSpendCard({ amount }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  return (
    <div className="total-spend-card">
      <p className="total-spend-label">Spent so far</p>
      <h1 className="total-spend-amount">{formatAmount(amount)}</h1>
    </div>
  )
}

export default TotalSpendCard
