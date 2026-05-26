import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TransactionItem from './TransactionItem'

function CalendarView({ transactions, onTapTransaction }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDayClick = (day) => {
    setSelectedDate(new Date(year, month, day))
  }

  const isSelected = (day) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    )
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  const hasTransaction = (day) => {
    return transactions.some((t) => {
      const txDate = new Date(t.date)
      return (
        txDate.getDate() === day &&
        txDate.getMonth() === month &&
        txDate.getFullYear() === year &&
        t.type === 'expense'
      )
    })
  }

  const selectedDateTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date)
    return (
      txDate.getDate() === selectedDate.getDate() &&
      txDate.getMonth() === selectedDate.getMonth() &&
      txDate.getFullYear() === selectedDate.getFullYear() &&
      t.type === 'expense'
    )
  })

  const selectedDateTotal = selectedDateTransactions.reduce((sum, t) => sum + t.amount, 0)

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const blanks = firstDay === 0 ? 6 : firstDay - 1

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          <ChevronLeft size={20} />
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-day-names">
        {dayNames.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {Array(blanks).fill(null).map((_, i) => (
          <div key={`blank-${i}`} className="calendar-day blank" />
        ))}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1
          return (
            <button
              key={day}
              className={`calendar-day ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              {day}
              {hasTransaction(day) && <span className="calendar-dot" />}
            </button>
          )
        })}
      </div>

      <div className="calendar-selected-date">
        <div className="calendar-selected-header">
          <span>{formatSelectedDate()}</span>
          {selectedDateTotal > 0 && (
            <span className="calendar-selected-total">{formatAmount(selectedDateTotal)}</span>
          )}
        </div>

        {selectedDateTransactions.length === 0 ? (
          <p className="calendar-empty">No expenses on this day</p>
        ) : (
          <div className="transaction-list">
            {selectedDateTransactions.map((transaction, index) => (
              <TransactionItem
                key={index}
                icon={transaction.icon}
                name={transaction.name}
                time={transaction.time}
                amount={transaction.amount}
                onTap={() => onTapTransaction(transaction)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarView