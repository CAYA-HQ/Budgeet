import TransactionItem from './TransactionItem'
import EmptyState from './EmptyState'

function TransactionList({ transactions, onAddExpense }) {
  if (!transactions || transactions.length === 0) {
    return <EmptyState onAddExpense={onAddExpense} />
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction, index) => (
        <TransactionItem
          key={index}
          icon={transaction.icon}
          name={transaction.name}
          time={transaction.time}
          amount={transaction.amount}
        />
      ))}
    </div>
  )
}

export default TransactionList