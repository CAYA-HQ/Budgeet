import TransactionItem from './TransactionItem'
import EmptyState from './EmptyState'

function TransactionList({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return <EmptyState />
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
