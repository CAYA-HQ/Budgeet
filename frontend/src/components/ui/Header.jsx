import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./header.module.css";

function Header() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const handleGuestClick = () => {
    navigate("/demo");
    console.log("Guest button clicked");
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      logout();
      navigate("/");
    } else {
      navigate("/auth", { state: { screen: "signin" } });
    }
  };

  return (
    <header
      className={`mx-auto sticky top-0.5 z-50 mt-4 w-[90%] md:w-[60%] max-w-[40rem] p-2 px-4 flex items-center justify-between rounded-2xl ${styles.header}`}
    >
      <div className="flex items-center gap-2">
        <div className="logo w-[1.5rem] h-[1.5rem] bg-[var(--budgeet-primary)] text-white font-semibold grid place-content-center rounded">
          B
        </div>
        <h2 className="text-sm md:text-base font-semibold md:font-bold">
          Budgeet
        </h2>
      </div>
      <div className="cta-bx flex gap-2">
        <button
          className="cta text-sm md:text-base font-normal md:font-semibold cursor-pointer"
          onClick={handleGuestClick}
        >
          Demo
        </button>
        <button className="to-dashboard">
          {
            isLoggedIn && <Link to="/dashboard"> Dashbaord </Link>

          }
        </button>
        <button
          className={`cta ${isLoggedIn ? "bg-red-600" : "bg-[var(--budgeet-primary)]"} text-white text-sm md:text-base font-normal md:font-semibold px-2 rounded cursor-pointer`}
          onClick={handleLoginClick}
        >
          {isLoggedIn ? "Log out" : "Login"}
        </button>
      </div>
    </header>
  );
}

export default Header;
