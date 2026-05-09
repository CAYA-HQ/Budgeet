import { Search, Bell } from "lucide-react";
import GreetingHeader from "../GreetingHeader";
import styles from "./dashboard-header.module.css";


function DashboardHeader() {
  const allMockData = {
    user: { name: "Elizabeth" },
  };
  return (
    <div className={`dashboard-header h-16 shrink-0 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-50 ${styles.dashboardHeader}`}>
      <div className="left h-full flex items-center">
        <GreetingHeader name={allMockData.user.name} />
      </div>
      <div className="right flex gap-5 items-center">
        <Search size={20} />
        <Bell size={20} />
      </div>
    </div>
  );
}

export default DashboardHeader;
