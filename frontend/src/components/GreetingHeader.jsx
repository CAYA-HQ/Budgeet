import { useState } from "react";
import { ChevronDown, ChevronUp, User, Settings, LogOut} from "lucide-react";
import styles from "./greetings-header.module.css";

function GreetingHeader({ name }) {
  const [isOpen, setIsOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleDroDown = () => {
    setIsOpen(!isOpen);
  };

  console.log(isOpen);

  return (
    <div
      className={`greeting-header h-full${styles.greetingsHeader}`}
    >
      <button className="greeting-dropdown  flex items-center gap-2 cursor-pointer" onClick={handleDroDown}>
      <div className="greeting-avatar">
        {name ? name.charAt(0).toUpperCase() : "E"}
      </div>
      
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <ul className="greeting-dropdown-content absolute top-[4rem] right-0 md:right-19 shadow-2xl z-50">
          <div className="h-20 flex items-center justify-center gap-2 border-b">
            <div className="greeting-avatar">
              {name ? name.charAt(0).toUpperCase() : "E"}
            </div>
            <div className="greeting-text">
              <h2>
                {getGreeting()}, {name || "Explorer"}
              </h2>
              <p>Track your expenses, start your day right</p>
            </div>
          </div>
          <li><User /> My Profile</li>
          <li><Settings />Settings</li>
          <li><LogOut />Logout</li>
        </ul>
      )}
      {/* <div className="greeting-text">
        <h2>{getGreeting()}, {name || "Explorer"}</h2>
        <p>Track your expenses, start your day right</p>
      </div> */}
    </div>
  );
}

export default GreetingHeader;
export default GreetingHeader;
