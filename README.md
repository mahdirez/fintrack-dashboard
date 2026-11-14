# FinTrack

A personal finance dashboard built with React, TypeScript, Zustand and Recharts. Track income and expenses, categorize transactions, set monthly budgets, visualize spending and export your data to CSV.

**Live demo:** https://fintrack-dashboard-pi-murex.vercel.app/

## Features

- Add, edit and delete transactions with form validation (React Hook Form + Zod)
- Search and filter by type, category and date range
- Dashboard with income, expense and balance summary
- Donut chart (spending by category) and bar chart (last 6 months)
- Monthly budgets per category with progress bars and alerts at 80% / 100%
- CSV export of the filtered list (with formula-injection protection)
- Dark mode with no flash on load
- Responsive layout with a mobile navigation drawer
- Data persisted in localStorage
- Unit and component tests with Vitest and React Testing Library

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand (with persist middleware) |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Routing | React Router |
| Testing | Vitest, React Testing Library |

## Getting started

```bash
git clone https://github.com/mahdirez/fintrack-dashboard.git
cd fintrack-dashboard
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Project structure

```
src/
├── components/   # Reusable UI components
├── hooks/        # Custom hooks (useTheme, useDebounce)
├── pages/        # Route-level pages
├── schemas/      # Zod validation schemas
├── store/        # Zustand store
├── test/         # Test setup and factories
├── types/        # Shared TypeScript types
└── utils/        # Pure helpers (filters, budgets, CSV, charts)
```

## Design decisions

- **Pure utilities:** all calculations (summary, budgets, filters, chart data, CSV) are pure functions, which makes them easy to test.
- **Selective persistence:** only transactions and budgets are saved, so default categories can evolve without migrations.
- **Theme via CSS variables:** dark mode overrides Tailwind color variables, so components don't need `dark:` variants.



## Possible improvements

- Custom categories
- Recurring transactions
- Multi-currency support
- Import from CSV
- Cloud sync

## License

MIT