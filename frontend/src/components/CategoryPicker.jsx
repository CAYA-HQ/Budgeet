import { Utensils, Zap, Users, Heart, Fuel, Smartphone, BookOpen, Tv, ShoppingBag, Plane, Coffee, Landmark, ArrowLeftRight, Car, Home, Package } from 'lucide-react'

const categories = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'bills', label: 'Bills/Utilities', icon: Zap },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'healthcare', label: 'Healthcare', icon: Heart },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
  { id: 'phone', label: 'Phone/Internet', icon: Smartphone },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'entertainment', label: 'Entertainment', icon: Tv },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'socializing', label: 'Socializing', icon: Coffee },
  { id: 'withdrawal', label: 'Withdrawal', icon: Landmark },
  { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { id: 'transport', label: 'Transportation', icon: Car },
  { id: 'housing', label: 'Housing', icon: Home },
  { id: 'miscellaneous', label: 'Miscellaneous', icon: Package },
]

function CategoryPicker({ selected, onSelect, onClose }) {
  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet category-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h2 className="category-title">Select category</h2>
        <p className="category-subtitle">Select a category that best describes what you spent your money on.</p>
        <div className="category-grid">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                className={`category-item ${selected?.id === cat.id ? 'active' : ''}`}
                onClick={() => {
                  onSelect(cat)
                  onClose()
                }}
              >
                <div className="category-icon">
                  <Icon size={20} />
                </div>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CategoryPicker
export { categories }