import { useState } from "react"
import { Outlet, useOutletContext } from "react-router-dom"
import DashboardHeader from "../ui/DashboardHeader"
import SideNav from "../SideNav"
import BottomNav from "../BottomNav"

function DashboardLayout() {
  const [fabOpen, setFabOpen] = useState(false)
  const [addExpenseTrigger, setAddExpenseTrigger] = useState(false)
  const [addIncomeTrigger, setAddIncomeTrigger] = useState(false)

  // const handleAddExpense = () => {
  //   setFabOpen(false)
  //   setAddExpenseTrigger((prev) => !prev)
  // }

  // const handleAddIncome = () => {
  //   setFabOpen(false)
  //   setAddIncomeTrigger((prev) => !prev)
  // }

  return (
    <div className="app flex items-stretch h-screen overflow-hidden">
      <SideNav />
      <main className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        <DashboardHeader />
        <Outlet context={{ addExpenseTrigger, addIncomeTrigger }} />
      </main>
      {/* <BottomNav
        fabOpen={fabOpen}
        setFabOpen={setFabOpen}
        onAddExpense={handleAddExpense}
        onAddIncome={handleAddIncome}
      /> */}
    </div>
  )
}

export default DashboardLayout