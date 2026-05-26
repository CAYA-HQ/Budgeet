import { Link, Outlet } from 'react-router-dom'
import Header from './ui/Header'

function Layout() {
  return (
    <div className="app flex flex-col items-center">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
