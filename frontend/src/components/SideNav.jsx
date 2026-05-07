import { Link, useLocation } from "react-router-dom";
import { Home, Receipt, Wallet, Lightbulb, Settings, LogOut } from "lucide-react";

function SideNav() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/dashboard/expenses", label: "Expenses", icon: Receipt },
    { path: "/dashboard/budget", label: "Budget", icon: Wallet },
    { path: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  ];

  return (
    <div className="side-nav">
      <div className="top">
        <div className="side-nav-logo">
          <h2>Budgeet</h2>
        </div>
        <nav className="side-nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`side-nav-item ${location.pathname === item.path ? "active" : ""}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="bottom flex flex-col items-start justify-center">
        <Link className={`side-nav-item ${location.pathname === "settings" ? "active" : ""}`}><Settings size={20} />Settings</Link>
        <button className={`side-nav-item cursor-pointer ${location.pathname === "logout" ? "active" : ""}`}><LogOut size={20} /> Logout</button>
      </div>
    </div>
  );
}

export default SideNav;
