import { Search, Bell } from "lucide-react";
import GreetingHeader from "../GreetingHeader";
import styles from "./dashboard-header.module.css";


function DashboardHeader() {
  const allMockData = {
    user: { name: "Elizabeth" },
  };
  return (
    <div className={`dashboard-header h-16 shrink-0 bg-white border-b border-gray-100 px-6 flex items-center justify-end md:justify-between sticky top-0 z-50 ${styles.dashboardHeader}`}>
     
        <form action="" className="right w-full max-w-[90%] bg-white md:w-80 flex gap-1 items-center absolute md:static top-[4rem]">
        <input 
        type="search" 
        className="w-full h-10 border rounded-l-sm" 
        placeholder="Search" 
        
        
        />
        <button type="submit" className="md:w-20 h-10 flex justify-center items-center rounded-r-sm md:border">
          <Search size={20} />
        </button>
        
        </form>

      <div className="left h-full flex items-center gap-4">
        <Bell size={20} />
        <GreetingHeader name={allMockData.user.name} />
      </div>
      
    </div>
  );
}

export default DashboardHeader;
