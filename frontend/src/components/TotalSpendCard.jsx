import { useEffect, useState } from 'react'

function TotalSpendCard({ amount }) {
  const [displayAmount, setDisplayAmount] = useState(0)

  useEffect(() => {
    if (amount === 0) {
      setDisplayAmount(0)
      return
    }

    const duration = 600
    const steps = 30
    const increment = amount / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setDisplayAmount(amount)
        clearInterval(timer)
      } else {
        setDisplayAmount(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [amount])

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  return (
    <div className="total-spend-card">
      <p className="total-spend-label">Spent so far</p>
      <h1 className="total-spend-amount">{formatAmount(displayAmount)}</h1>
    </div>
  )
}

export default TotalSpendCard