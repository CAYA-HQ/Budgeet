# Budgeet Developer Flow Guide

This document explains how the app works from a developer's perspective.

---

## User Types

| User Type | Description |
|-----------|-------------|
| Guest | Not logged in, sees demo data |
| Authenticated | Logged in, sees real data |

---

## App Flow

Landing Page
- Login CTA → Auth Page → Login → Dashboard
- Guest CTA → Demo Dashboard → Get Started → Auth Page (Register) → Dashboard

---

## How Each Page Should Behave

### Landing Page
- Visible to everyone
- Has two CTAs: Login and Guest
- Login → redirects to /auth
- Guest → redirects to /demo

### Demo Dashboard
- Visible to guest users only
- Uses hardcoded sample data, no backend needed
- Has a Get Started CTA → redirects to /auth on Register view

### Auth Page
- Handles Login, Register and Forgot Password
- After Login → redirect to /dashboard
- After Register → redirect to /dashboard
- Get Started from demo → opens on Register view by default

### Dashboard
- Logged in users only
- Fetches real data from backend
- Shows totals, top category, recent expenses, budget progress

### Expenses
- Logged in users only
- Add, edit, delete expenses
- Updates dashboard instantly

### Budget
- Logged in users only
- Set monthly budget
- Shows progress bar and remaining balance

### Insights
- Logged in users only
- Shows spending patterns and smart feedback

---

## How Developers Should Build

1. Build UI first with hardcoded mock data
2. Make sure it looks right and works correctly
3. Connect to backend when Emmanuel Oku's API is ready
4. Test with real data
5. Submit Pull Request to dev branch

---

## Data Types

| Data | Guest | Authenticated |
|------|-------|---------------|
| Dashboard data | Hardcoded sample | Fetched from backend |
| Expenses | Not saved | Saved to database |
| Budget | Not saved | Saved to database |
| Insights | Based on sample data | Based on real data |

---

## Important Rules

- Nobody pushes directly to main or dev
- Every feature branch merges into dev via Pull Request
- At least one review before merging
- Build with mock data first, connect backend later
- Shared components folder is touched by agreement only