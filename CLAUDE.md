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

**State management**: Lightweight React Context split across two files in `src/context/`:
- `context.js` — raw `createContext()` call (keeps the provider and consumer decoupled)
- `UserContext.jsx` — the `UserProvider` component with state management + localStorage persistence under key `cc:user`. Loads saved state on mount and persists whenever the user object changes (only if at least one meaningful field is filled). Accessed via the `useUser()` hook (`src/hooks/useUser.js`).

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

**Styling**: Plain CSS per component — every `.jsx` file has a co-located `.css` file with matching name. No CSS framework. Dark theme via CSS custom properties in `src/app.css` (`--bg`, `--surface`, `--line`, `--muted`). Responsive breakpoints at 576/768/992/1200px.

**Icons**: All icons are custom inline SVGs in `src/components/Icons.jsx` — Lucide-inspired, stroke-based, 24×24 viewBox. No icon library dependency. When adding icons, add them here rather than pulling in a package.

**Vite config** (`vite.config.js`): Uses `@vitejs/plugin-react-swc`, output to `dist/`, base path `/`.

**Vercel deployment** (`vercel.json`): Configured as a Vite SPA with SPA fallback rewrites (`/(.*)` → `/index.html`). Builds from `dist/`.

## Important patterns

- `UserForm` on the Overview page uses `useUser()` context to store form data globally; the WorkoutPlan page uses its own inline `WorkoutForm` component with local state (it doesn't use the shared context).
- The `Modal` component is a generic overlay/dialog used for validation errors. Closes on Esc key or overlay click; locks body scroll while open.
- `ResultCard` displays a calorie goal with macros (title, kcal, protein/fat/carbs in grams). Uses `CARD_CONFIG` to map titles to icons and descriptions.
