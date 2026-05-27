import { useState, useEffect, useRef } from "react";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function GreetingHeader({ name }) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/dashboard/profile");
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[var(--budgeet-primary)] rounded-full flex items-center justify-center">
          <span className="text-white text-xs sm:text-sm font-medium font-poppins">
            {user ? (user.full_name || user.name)?.charAt(0).toUpperCase() : "E"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 hidden sm:block transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-gray-200 py-1.5 z-[100]">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-[var(--budgeet-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium font-poppins">
                    {user ? (user.full_name || user.name)?.charAt(0).toUpperCase() : "E"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 font-poppins truncate">
                    {user?.full_name || user?.name || name || "Explorer"}
                  </p>
                  <p className="text-xs text-gray-500 font-poppins truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-0.5">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 font-poppins transition-colors"
              >
                <User size={14} />
                <span>My Profile</span>
              </button>
            </div>

            <div className="border-t border-gray-100 my-0.5"></div>

            <div className="py-0.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-poppins transition-colors"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default GreetingHeader