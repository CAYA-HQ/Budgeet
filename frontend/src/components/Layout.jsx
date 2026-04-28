import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="app">
      <nav>
        <Link to="/">Budgeet</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/insights">Insights</Link>
      </nav>
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
