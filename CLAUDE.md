# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint (flat config)
```

No test suite is configured.

## Architecture

This is a **client-side-only React 19 SPA** — no backend, no API calls. All calculations run in the browser.

**Routing** (`src/App.jsx`): React Router v7 with two routes:
- `/` → `Overview` page (calorie calculator)
- `/workout` → `WorkoutPlan` page (workout recommendation)

**State management**: Lightweight React Context (`src/context/UserContext.jsx`) + `useUser` hook (`src/hooks/useUser.js`). User form data is persisted to `localStorage` under key `cc:user`.

**Core business logic** lives in `src/utils/calories.js`:
- `ACTIVITY_LEVELS` — activity multipliers (sedentary → athlete)
- `bmr()` — Mifflin-St Jeor equation (metric units: kg, cm, years)
- `tdee()` — BMR × activity factor
- `goals()` — Returns maintenance/cut/bulk calorie targets. Uses a weight-difference-based approach (~7700 kcal/kg fat) over 12-week (cut) or 16-week (bulk) timelines. Macro split: 1.8g protein/kg, 25% fat, remainder carbs.

**Component tree**:
```
App
├── UserProvider (Context)
│   └── Router
│       └── Layout (sidebar nav + mobile hamburger)
│           ├── Overview ── UserForm, ResultCard (×4), Modal
│           └── WorkoutPlan ── inline WorkoutForm, Modal, workout plan display
```

**Styling**: Plain CSS per component, no framework. Dark theme via CSS custom properties in `src/app.css` (`--bg`, `--surface`, `--line`, `--muted`). Responsive breakpoints at 576/768/992/1200px.

**Vite config** (`vite.config.js`): Uses `@vitejs/plugin-react-swc`, output to `dist/`, base path `/`.

**Important patterns**:
- `UserForm` on the Overview page uses `useUser()` context to store form data globally; the WorkoutPlan page uses its own inline `WorkoutForm` component with local state (it doesn't use the shared context).
- The `Modal` component is a generic overlay/dialog used for validation errors.
- `ResultCard` displays a calorie goal with macros (title, kcal, protein/fat/carbs in grams).
