import { Outlet } from "react-router-dom";
import DashboardHeader from "../ui/DashboardHeader";
import SideNav from "../SideNav";

function DashboardLayout() {
  return (
    <div className="app flex items-stretch h-screen overflow-hidden">
      <SideNav />
      <main className="flex-1 flex flex-col overflow-y-auto">    
        <DashboardHeader />  
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;