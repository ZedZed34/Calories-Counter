---
name: react-vite-workflow
description: >
  Use this skill when adding pages, routes, components, or styles; running dev/build/lint/test commands; or navigating the project structure. Documents the full file tree, npm scripts, routing patterns, CSS conventions ("Neon Court" dark theme), and component conventions.
---

# React + Vite Workflow

React 19 SPA, Vite 7, React Router 7. Client-side only — no backend.

## Commands

| Command | What |
|---------|------|
| `npm run dev` | Vite dev server → `http://localhost:5173` |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint flat config |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |

No `npm start` — use `npm run dev`.

## Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.1.3",
  "@supabase/supabase-js": "^2.108.2",
  "@vitejs/plugin-react-swc": "^4.0.0",
  "vite": "^7.1.2",
  "vitest": "^4.1.9",
  "@testing-library/react": "^16.3.2",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^14.6.1",
  "jsdom": "^29.1.1"
}
```

Vite config (`vite.config.js`): SWC React plugin, output to `dist/`, base path `/`, Vitest with jsdom environment, globals enabled, setup file `src/test/setup.js`.

ESLint (`eslint.config.js`): Flat config. `@eslint/js` recommended + `react-hooks` latest + `react-refresh` vite. `no-unused-vars` error (ignores `^[A-Z_]` pattern). Ignores `dist/`.

Vercel (`vercel.json`): SPA fallback — all routes rewrite to `/index.html`. Builds from `dist/`.

## File Tree

```
src/
├── App.jsx                    # Router + context providers
├── app.css                    # Design system (Neon Court)
├── main.jsx                   # Entry point, StrictMode
├── index.css                  # Minimal body reset
├── assets/
│   └── images/
│       └── Result.jpg
├── components/
│   ├── Icons.jsx              # All SVG icons (one file)
│   ├── Layout.jsx             # Sidebar nav + mobile hamburger + .rise observer
│   ├── Layout.css
│   ├── Modal.jsx              # Generic overlay dialog
│   ├── Modal.css
│   ├── Modal.test.jsx
│   ├── ProtectedRoute.jsx     # Auth gate → redirects to /auth
│   ├── ResultCard.jsx         # Calorie goal card with macros
│   ├── ResultCard.css
│   ├── ResultCard.test.jsx
│   ├── UserForm.jsx           # Sex/age/height/weight/activity/target
│   ├── UserForm.css
│   ├── UserForm.test.jsx
│   ├── WorkoutForm.jsx        # Workout-specific form (local state)
│   └── WorkoutForm.css
├── context/
│   ├── auth.js                # createContext for AuthCtx
│   ├── AuthContext.jsx        # AuthProvider: session, profile, signUp/In/Out
│   ├── context.js             # createContext for UserContext
│   └── UserContext.jsx        # UserProvider: form state → localStorage 'cc:user'
├── hooks/
│   ├── useAuth.js             # useContext(AuthCtx)
│   └── useUser.js             # useContext(UserContext)
├── lib/
│   ├── foodSearch.js          # Open Food Facts API integration
│   └── supabase.js            # Supabase client from env vars
├── pages/
│   ├── Auth.jsx               # Sign in / sign up
│   ├── Auth.css
│   ├── Dashboard.jsx          # Today's macros + food log preview (protected)
│   ├── Dashboard.css
│   ├── FoodLog.jsx            # Food search + log by date/meal (protected)
│   ├── FoodLog.css
│   ├── Overview.jsx           # Calorie calculator (public)
│   ├── Overview.css
│   ├── Progress.jsx           # Weight + calorie charts (protected)
│   ├── Progress.css
│   ├── WorkoutPlan.jsx        # Workout recommendation (public)
│   └── WorkoutPlan.css
├── test/
│   └── setup.js               # Vitest setup (jsdom)
└── utils/
    ├── calories.js            # BMR, TDEE, goals, ACTIVITY_LEVELS
    └── calories.test.js
```

Conventions:
- Every `.jsx` file has a co-located `.css` file with the same basename.
- Tests: `*.test.jsx` or `*.test.js` alongside the source file.
- Icons: all in `Icons.jsx` — Lucide-inspired, stroke-based, 24×24 viewBox. Never pull an icon package.
- Context: split across `context.js` (raw `createContext`) + `Context.jsx` (provider logic) to keep provider and consumer decoupled.

## Routing

React Router 7 with `BrowserRouter` in `App.jsx`. Two providers wrap the router:

```
App
├── AuthProvider (AuthContext — Supabase auth state)
│   └── UserProvider (UserContext — localStorage form state)
│       └── Router
│           └── Layout (sidebar + mobile nav)
│               └── Routes
│                   ├── /           → Overview (public)
│                   ├── /workout    → WorkoutPlan (public)
│                   ├── /auth       → Auth (public)
│                   ├── /dashboard  → ProtectedRoute → Dashboard
│                   ├── /log        → ProtectedRoute → FoodLog
│                   └── /progress   → ProtectedRoute → Progress
```

Public routes: `/`, `/workout`, `/auth`. Protected routes: `/dashboard`, `/log`, `/progress` (gated by `ProtectedRoute` — redirects to `/auth` if not authenticated).

## How to Add a New Page

1. **Create page files:**
   ```
   src/pages/NewPage.jsx
   src/pages/NewPage.css
   ```

2. **Write the page component:**
   ```jsx
   import React, { useEffect } from 'react';
   import './NewPage.css';

   export default function NewPage() {
     useEffect(() => {
       document.title = 'New Page | Calories Counter';
     }, []);

     return (
       <div className="new-page">
         <div className="page-hero">
           <h2 className="hero-title">
             <span className="hero-accent">New</span> Page
           </h2>
           <p className="hero-subtitle">Description text</p>
         </div>
         {/* Page content */}
         <footer className="copyright-footer">
           <p>Copyright &copy;2026 Billy Htet</p>
         </footer>
       </div>
     );
   }
   ```

3. **Add route in `src/App.jsx`:**
   ```jsx
   import NewPage from './pages/NewPage';

   // Inside <Routes>:
   <Route path="/new-page" element={<NewPage />} />
   ```

4. **Add nav link in `src/components/Layout.jsx`:**
   ```jsx
   <Link
     to="/new-page"
     className={`nav-link ${location.pathname === '/new-page' ? 'active' : ''}`}
     onClick={closeMobileMenu}
   >
     <span className="nav-icon">
       {/* SVG icon — 20×20, stroke, 2px width */}
     </span>
     <span className="nav-label">New Page</span>
     {location.pathname === '/new-page' && <span className="nav-indicator" />}
   </Link>
   ```

5. **For protected pages**, wrap in `<ProtectedRoute>`:
   ```jsx
   <Route path="/new-page" element={
     <ProtectedRoute><NewPage /></ProtectedRoute>
   } />
   ```

## CSS Conventions — "Neon Court" Design System

Dark theme. All design tokens in `src/app.css` `:root`.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--base` | `#101012` | Page background (charcoal, never pure black) |
| `--ink` | `#F5F5F2` | Primary text (off-white) |
| `--accent` | `#f73f3d` | Acid red — CTAs, highlights, stat numbers |
| `--support` | `#FF5D3A` | Hot ember — secondary tags, hover states |
| `--wash` | `#1A1A1E` | Raised surfaces |
| `--line-subtle` | `#1A1A1E` | Subtle borders |
| `--line-default` | `#2A2A30` | Default borders |
| `--line-strong` | `#3A3A44` | Strong borders |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--display` | `'Archivo Black', sans-serif` | Display/hero headings, stat numbers |
| `--body` | `'Archivo', sans-serif` | Body text, form labels, nav |

Google Fonts import in `index.html`: `Archivo Black` + `Archivo` (400/500/600/700).

Base: `16px`, `line-height: 1.6`, `-webkit-font-smoothing: antialiased`.

### Utility Classes

- `.container` — max-width `72rem`, centered with responsive padding
- `.h-display` — uppercase, clamp(3rem, 9vw, 7rem), Archivo Black
- `.h-section` — uppercase, clamp(1.85rem, 4.5vw, 3.25rem), Archivo Black
- `.kicker` — 0.75rem, uppercase, 0.2em letter-spacing, accent color
- `.lede` — muted text, max-width 32rem
- `.ncard` — background `#141417`, 1px border, hover lift + red glow shadow
- `.stat .n` — display font, clamp(2.5rem, 6vw, 4.5rem), accent color
- `.stat .l` — 0.6875rem, uppercase, muted
- `.grain` — fixed SVG noise overlay, `opacity: 0.05`, `pointer-events: none`
- `.rise` — scroll-triggered entrance (opacity 0 → 1, translateY 18px → 0)
- `.btn` — skew(-2deg), hard black shadow, slam on press
- `.btn--support` — transparent with inset border + shadow

### Page Hero Pattern

Every page uses this pattern:
```html
<div class="page-hero">
  <h2 class="hero-title">
    <span class="hero-accent">Page</span> Name
  </h2>
  <p class="hero-subtitle">Subtitle text</p>
</div>
```

Styled in each page's own CSS.

### Component CSS Rules

- Each component/page imports its own `.css` file.
- Use CSS custom properties from `app.css` (never hardcode color values in component CSS).
- No CSS framework. No Tailwind. Plain CSS only.
- Responsive breakpoints: 576px, 768px, 992px, 1200px.
- Touch targets: minimum 44×44px (`touch-action: manipulation` on interactive elements).
- Focus: `:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }`.

### Animation

- `.rise` elements get staggered `transition-delay` via IntersectionObserver in `Layout.jsx` (cycle of 4, 70ms increments, 210ms max).
- Keyframes available: `fadeInUp`, `fadeIn`, `scaleIn`, `slamIn`, `shimmer`, `countUp`.
- Stagger utilities: `.stagger-1` through `.stagger-4` (50ms–200ms delays).
- `prefers-reduced-motion: reduce` — kills all animations and transitions (0.01ms duration).

## Component Conventions

### Icon SVG Pattern
```jsx
// In src/components/Icons.jsx — add new icons here
export function MyIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* paths, lines, circles... */}
    </svg>
  );
}
```

### State Management
- **Auth state** → `AuthContext` via `useAuth()`: `{ user, profile, isAuthenticated, loading, signUp, signIn, signOut, updateProfile }`
- **Form state** → `UserContext` via `useUser()`: `{ user, setUser }` — persisted to `localStorage` key `cc:user`
- **Local state** → `useState` in individual components (e.g., `WorkoutForm` uses local state, not context)

### Business Logic
Never inline formulas. Always import from `src/utils/calories.js`:
```js
import { bmr, tdee, goals, ACTIVITY_LEVELS } from '../utils/calories';
```

## Related Skills

- [[nutrition-math]] — BMR/TDEE/macro formulas in `calories.js`
- [[supabase-schema]] — database tables and query patterns
- [[calorie-tracker-architect]] — component architecture rules
