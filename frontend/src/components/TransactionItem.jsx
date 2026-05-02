import { Utensils, Car, ShoppingBag, Heart, Home, Tv, BookOpen, Package, Zap, Users, Fuel, Smartphone, Plane, Coffee, Landmark, ArrowLeftRight } from 'lucide-react'

const categoryIcons = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  healthcare: Heart,
  housing: Home,
  entertainment: Tv,
  education: BookOpen,
  miscellaneous: Package,
  bills: Zap,
  family: Users,
  fuel: Fuel,
  phone: Smartphone,
  travel: Plane,
  socializing: Coffee,
  withdrawal: Landmark,
  transfer: ArrowLeftRight,
}

function TransactionItem({ icon, name, time, amount, onTap, isNew }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const Icon = categoryIcons[icon] || Package

  return (
    <div
      className={`transaction-item ${isNew ? 'animate-in' : ''}`}
      onClick={onTap}
      style={{ cursor: 'pointer' }}
    >
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