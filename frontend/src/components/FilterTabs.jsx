import { useState } from 'react'

function FilterTabs({ onFilterChange }) {
  const [activeTab, setActiveTab] = useState('today')

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'thisWeek', label: 'This week' },
    { id: 'thisMonth', label: 'This month' },
    { id: 'calendar', label: 'Calendar' },
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    if (onFilterChange) onFilterChange(tabId)
  }

  return (
    <div className="filter-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default FilterTabs
