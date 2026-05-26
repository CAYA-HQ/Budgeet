# Budgeet Dashboard Documentation

This document covers everything the developer needs to build the Demo Dashboard and Real Dashboard.

---

## Two Dashboard Modes

| Mode | Route | User | Data |
|------|-------|------|------|
| Demo Dashboard | /demo | Guest | Hardcoded sample data |
| Real Dashboard | /dashboard | Logged in user | Fetched from backend |

---

## Greeting Logic

Time-based greeting that changes based on time of day.

| Time | Greeting |
|------|---------|
| 6am - 11:59am | Good morning |
| 12pm - 4:59pm | Good afternoon |
| 5pm - 11:59pm | Good evening |

Demo: "Good morning, Explorer"
Real: "Good morning, Ade" (real user name from auth)

---

## Dashboard Layout

### Mobile
Greeting Header
Filter Tabs
Total Spend Card
Budget Progress Bar
Transaction List
Bottom Nav (Home | + | Insights)

### Desktop
Side Nav          Main Content
(Home)            Greeting Header
(Expenses)        Filter Tabs
(Budget)          Total Spend Card
(Insights)        Budget Progress Bar
Transaction List

---

## Components

### 1. GreetingHeader
- Shows avatar, greeting text and subtitle
- Subtitle: "Track your expenses, start your day right"
- Demo: avatar is a default icon
- Real: avatar is user profile picture or initials

### 2. FilterTabs
- Today, This week, This month, Calendar
- Filters the transaction list and total spend card
- Active tab is highlighted

### 3. TotalSpendCard
- Dark background, white text
- Label: "Spent so far"
- Amount in bold large font
- Updates based on active filter tab

### 4. BudgetProgressBar
- Shows monthly budget progress
- Label: "Monthly Budget"
- Progress bar with gradient color
- Green → below 50%
- Yellow → between 50% and 80%
- Red → above 80%
- Shows amount spent, total budget and remaining balance
- If no budget set → "Tap to set a budget"

### 5. TransactionList
- List of recent expenses
- Each item shows: icon, name, time, amount
- If no transactions → show EmptyState component

### 6. TransactionItem
- Icon (category based)
- Merchant name
- Time
- Amount

### 7. EmptyState
- Simple wallet SVG illustration
- Text: "Nothing here yet"
- Subtext: "Tap the + button to log your first expense"
- Small CTA button: "Add your first expense"

### 8. FABMenu (Floating Action Button)
- Plus button in center of bottom nav
- On tap → expands into two options with animation
- Option 1: Add Expense
- Option 2: Add Income
- Plus icon rotates to X on expand

### 9. BottomNav (Mobile only)
- Home icon → /dashboard
- FABMenu → center
- Insights icon → /insights

### 10. SideNav (Desktop only)
- Home → /dashboard
- Expenses → /expenses
- Budget → /budget
- Insights → /insights
---

## Demo Dashboard Hardcoded Data
Greeting: "Good morning/afternoon/evening, Explorer"
Total Spend: 45200
Budget: 50000 monthly
Budget Spent: 45000
Budget Remaining: 5000
Budget Percentage: 90%
Transactions: [
{ icon: "food", name: "Chicken Republic", time: "9:21 AM", amount: 2500 },
{ icon: "transport", name: "Uber", time: "10:15 AM", amount: 1800 },
{ icon: "shopping", name: "Zara", time: "11:30 AM", amount: 25000 },
{ icon: "healthcare", name: "Pharmacy", time: "12:45 PM", amount: 3400 },
{ icon: "housing", name: "Rent", time: "2:00 PM", amount: 12500 }
]
---

## Build Order

1. GreetingHeader
2. FilterTabs
3. TotalSpendCard
4. BudgetProgressBar
5. TransactionItem
6. TransactionList
7. EmptyState
8. FABMenu
9. BottomNav
10. SideNav
11. Wire everything together in DemoDashboardPage
12. Wire everything together in DashboardPage

---

## Important Notes

- Build with mock data first
- Connect to backend when Emmanuel Oku API is ready
- Demo and Real dashboards share the same components
- Only the data source is different
- Currency format: ₦ (Naira)
- All amounts formatted with commas e.g 45,200.00
EOF