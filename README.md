# Budgeet
A lightweight, mobile-first expense tracking application that helps users log daily expenses and understand their spending behavior.

## Tech Stack
- React.js (Vite)
- Vanilla CSS + Tailwind CSS v4
- ShadCN (Radix + Nova preset)
- React Router DOM

## Project Structure
Feature-based folder structure. Each developer owns a feature folder.
Budgeet/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/        # Shared/reusable components only
│   │   ├── features/
│   │   │   ├── landing/
│   │   │   ├── demo/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── expenses/
│   │   │   ├── budget/
│   │   │   └── insights/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
└── backend/

## Getting Started
1. Clone the repository
2. Run `cd frontend`
3. Run `npm install`
4. Run `git checkout dev`
5. Run `git checkout -b feature/your-feature-name`
6. Run `npm run dev`

## Pages & Routes
| Page | Route | Access |
|------|-------|--------|
| Landing | `/` | Everyone |
| Demo Dashboard | `/demo` | Guest users only |
| Auth | `/auth` | Everyone |
| Dashboard | `/dashboard` | Logged in users only |
| Expenses | `/expenses` | Logged in users only |
| Budget | `/budget` | Logged in users only |
| Insights | `/insights` | Logged in users only |

## User Flow
Landing Page
├── Login → Auth Page → Dashboard
└── Guest → Demo Dashboard → Get Started → Auth Page (Register) → Dashboard

## Branching Strategy
- `main` → production ready code only
- `dev` → integration branch, all features merge here first
- `feature/*` → individual feature branches

## Commit Conventions
- `feat:` → new feature
- `fix:` → bug fix
- `style:` → styling changes
- `docs:` → documentation updates

## Component Ownership
| Developer | Feature |
|-----------|---------|
| Suru | Landing Page |
| Tosin | Demo Dashboard |
| Emmanuel Oku | Auth Page + Backend |
| Team Lead | Dashboard, Expenses, Budget, Insights |
| Emmanuel Designer | Design system, assets, UI review |

## Team
Team 2 — Budgeet