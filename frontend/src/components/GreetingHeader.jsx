function GreetingHeader({ name }) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return "Good morning"
    if (hour >= 12 && hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="greeting-header h-full flex items-center">
      <div className="greeting-avatar">
        {name ? name.charAt(0).toUpperCase() : "E"}
      </div>
      <div className="greeting-text">
        <h2>{getGreeting()}, {name || "Explorer"}</h2>
        <p>Track your expenses, start your day right</p>
      </div>
    </div>
  )
}

export default GreetingHeader
