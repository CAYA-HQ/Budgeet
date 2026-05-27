import { Search, TrendingDown, TrendingUp } from 'lucide-react'
import { formatNaira } from '../lib/utils'

function SearchResults({ results, loading, query, onTapTransaction }) {
  if (loading) {
    return (
      <div className="loading-state">
        <Search size={16} style={{ display: 'inline', marginRight: 6 }} />
        Searching for &quot;{query}&quot;…
      </div>
    )
  }

  if (!results.length) {
    return (
      <div className="empty-state">
        <Search size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
        <p>No results for &quot;{query}&quot;</p>
        <span>Try a different keyword or category</span>
      </div>
    )
  }

  return (
    <div className="search-results">
      <p className="search-results-count">
        {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </p>
      <ul className="transaction-list">
        {results.map((item) => (
          <li
            key={`${item.type}-${item.id}`}
            className="transaction-item"
            onClick={() => onTapTransaction?.(item)}
          >
            <div className={`transaction-icon ${item.type}`}>
              {item.type === 'expense'
                ? <TrendingDown size={16} />
                : <TrendingUp size={16} />
              }
            </div>
            <div className="transaction-info">
              <span className="transaction-name">{item.name}</span>
              <span className="transaction-meta">
                {item.category || item.income_type} · {item.date}
              </span>
            </div>
            <span className={`transaction-amount ${item.type}`}>
              {item.type === 'expense' ? '- ' : '+ '}
              {formatNaira(item.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SearchResults