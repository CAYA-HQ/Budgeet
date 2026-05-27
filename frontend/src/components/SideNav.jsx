import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Receipt, Wallet, Lightbulb, Settings, LogOut } from "lucide-react";
import logo from "/logo.svg";

function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();


  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/dashboard/expenses", label: "Expenses", icon: Receipt },
    { path: "/dashboard/budget", label: "Budget", icon: Wallet },
    { path: "/dashboard/insights", label: "Insights", icon: Lightbulb },
  ];

  return (
    <div className="side-nav">
      <div className="top">
        <div className="side-nav-logo flex items-center gap-2 cursor-pointer" onClick={()=> navigate("/")}>
          <img src={logo} alt="logo" />
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
      {/* <div className="bottom flex flex-col items-start justify-center">
        <Link className={`side-nav-item ${location.pathname === "settings" ? "active" : ""}`}><Settings size={20} />Settings</Link>
        <button className={`side-nav-item cursor-pointer ${location.pathname === "logout" ? "active" : ""}`}><LogOut size={20} /> Logout</button>
      </div> */}
    </div>
  );
}

export default SideNav;
