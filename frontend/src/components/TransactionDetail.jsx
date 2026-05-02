import { X, Pencil, Trash2 } from 'lucide-react'

function TransactionDetail({ transaction, onClose, onEdit, onDelete }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <button className="bottom-sheet-close" onClick={onClose}>
            <X size={20} />
          </button>
          <h2>Expense transaction details</h2>
        </div>

        <div className="transaction-detail-body">
          <div className="transaction-detail-amount">
            {formatAmount(transaction.amount)}
          </div>

          <div className="transaction-detail-name">
            {transaction.name}
          </div>

          <div className="transaction-detail-rows">
            <div className="transaction-detail-row">
              <span className="detail-label">Transaction Category</span>
              <span className="detail-value">{transaction.category}</span>
            </div>
            <div className="transaction-detail-row">
              <span className="detail-label">Transaction Date</span>
              <span className="detail-value">{formatDate(transaction.date)}</span>
            </div>
            <div className="transaction-detail-row">
              <span className="detail-label">Time</span>
              <span className="detail-value">{transaction.time}</span>
            </div>
            {transaction.description && (
              <div className="transaction-detail-row">
                <span className="detail-label">Description</span>
                <span className="detail-value">{transaction.description}</span>
              </div>
            )}
          </div>

          <div className="transaction-detail-actions">
            <button className="detail-edit-btn" onClick={onEdit}>
              <Pencil size={16} />
              Modify Expense
            </button>
            <button className="detail-delete-btn" onClick={onDelete}>
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetail