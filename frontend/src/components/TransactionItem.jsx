import { Utensils, Car, ShoppingBag, Heart, Home, Tv, BookOpen, Package } from 'lucide-react'

const categoryIcons = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  healthcare: Heart,
  housing: Home,
  entertainment: Tv,
  education: BookOpen,
  miscellaneous: Package,
}

function TransactionItem({ icon, name, time, amount }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const Icon = categoryIcons[icon] || Package

  return (
    <div className="transaction-item">
      <div className="transaction-icon">
        <Icon size={20} />
      </div>
      <div className="transaction-details">
        <p className="transaction-name">{name}</p>
        <p className="transaction-time">{time}</p>
      </div>
      <p className="transaction-amount">{formatAmount(amount)}</p>
    </div>
  )
}

export default TransactionItem
