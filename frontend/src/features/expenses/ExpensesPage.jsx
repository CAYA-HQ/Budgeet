import { useState } from 'react'
import { Search } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'
import TransactionItem from '../../components/TransactionItem'
import TransactionDetail from '../../components/TransactionDetail'
import AddExpense from '../../components/AddExpense'
import EmptyState from '../../components/EmptyState'
import '../../styles/dashboard.css'
import '../../styles/expenses.css'

function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [expenses, setExpenses] = useState([])

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'food', label: 'Food' },
    { id: 'transport', label: 'Transport' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'housing', label: 'Housing' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'education', label: 'Education' },
    { id: 'miscellaneous', label: 'Miscellaneous' },
  ]

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === 'all' || e.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const handleDeleteTransaction = (transaction) => {
    setExpenses((prev) => prev.filter((e) => e !== transaction))
    setSelectedTransaction(null)
    toast.success('Expense deleted')
  }

  return (
    <div className="expenses-page">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#000000',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '12px 20px',
          },
        }}
      />

      <div className="expenses-header">
        <h1>Expenses</h1>
        <p className="expenses-total">{formatAmount(totalExpenses)}</p>
      </div>

      <div className="expenses-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="expenses-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`expense-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAddExpense={() => {}} />
      ) : (
        <div className="expenses-list">
          {filtered.map((expense, index) => (
            <TransactionItem
              key={index}
              icon={expense.icon}
              name={expense.name}
              time={expense.time}
              amount={expense.amount}
              isNew={index === 0}
              onTap={() => setSelectedTransaction(expense)}
            />
          ))}
        </div>
      )}

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onEdit={() => {
            setEditingTransaction(selectedTransaction)
            setSelectedTransaction(null)
          }}
          onDelete={() => handleDeleteTransaction(selectedTransaction)}
        />
      )}

      {editingTransaction && (
        <AddExpense
          onClose={() => setEditingTransaction(null)}
          onSave={(updated) => {
            setExpenses((prev) =>
              prev.map((e) =>
                e === editingTransaction ? { ...updated, type: 'expense' } : e
              )
            )
            setEditingTransaction(null)
            toast.success('Expense updated')
          }}
          existing={editingTransaction}
        />
      )}
    </div>
  )
}

export default ExpensesPage