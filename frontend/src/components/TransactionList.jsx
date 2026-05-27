import TransactionItem from './TransactionItem'
import EmptyState from './EmptyState'

function TransactionList({ transactions, onAddExpense, onTapTransaction }) {
  const expenses = transactions.filter((t) => t.type === 'expense')

  if (!expenses || expenses.length === 0) {
    return <EmptyState onAddExpense={onAddExpense} />
  }

  return (
    <div className="transaction-list">
      {expenses.map((transaction, index) => (
        <TransactionItem
          key={index}
          icon={transaction.icon}
          name={transaction.name}
          time={transaction.time}
          amount={transaction.amount}
          isNew={index === 0}
          onTap={() => onTapTransaction && onTapTransaction(transaction)}
        />
      ))}
    </div>
  )
}

export default TransactionList