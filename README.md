# SpendWize
A lightweight, mobile-first expense tracking application that helps users log daily expenses and understand their spending behavior.

## Tech Stack
- React.js (Vite)
- Vanilla CSS + Tailwind CSS v4
- ShadCN (Radix + Nova preset)
- React Router DOM

## Project Structure
Feature-based folder structure. Each developer owns a feature folder.
spendwize/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/        # Shared/reusable components only
│   │   ├── features/
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
| Page | Route |
|------|-------|
| Dashboard | `/` |
| Expenses | `/expenses` |
| Budget | `/budget` |
| Insights | `/insights` |

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
| Frontend Dev 1 | Dashboard |
| Frontend Dev 2 | Expenses |
| Frontend Dev 3 | Budget |
| Frontend Dev 4 | Insights + Shared Components |
| Designer | Design system, assets, UI review |
| Backend Dev | /backend folder, API contract |

## Team
Team 2 — SpendWize
