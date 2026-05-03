import { Link } from 'react-router-dom'
import Header from './ui/Header'

function Layout({ children }) {
  return (
    <div className="app flex flex-col items-center">
      <Header />
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout
