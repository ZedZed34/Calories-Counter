# Full-Stack Migration Plan: Supabase (PostgreSQL)

## Goal

Transform the calorie **calculator** into an actual calorie **counter** — add user accounts, daily food logging, food search, and progress tracking. Keep the existing calculator + workout planner intact.

## Stack Decision

**Stay on Vite SPA + Supabase client directly.** No Next.js migration needed. Supabase provides auth, hosted Postgres, auto-generated REST API, and Row-Level Security — the client can query the database directly without a custom backend. Fits the current Vercel deployment model.

---

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase project
- New Supabase project (free tier)
- Note project URL + anon key

### 1.2 Install dependencies
```bash
npm install @supabase/supabase-js
```

### 1.3 Supabase client init
- New file: `src/lib/supabase.js` — singleton Supabase client

### 1.4 Environment variables
- `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Add `.env` to `.gitignore` (already ignored as `*.local` pattern doesn't match — verify)

---

## Phase 2: Database Schema

### 2.1 SQL migration (run in Supabase SQL editor)

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  sex TEXT,
  age INT,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  activity_key TEXT,
  target_weight_kg NUMERIC(5,1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Weight tracking over time
CREATE TABLE weight_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, logged_date)
);

-- Daily food log entries
CREATE TABLE food_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  servings NUMERIC(5,2) NOT NULL DEFAULT 1,
  calories NUMERIC(7,1) NOT NULL,
  protein_g NUMERIC(6,1) DEFAULT 0,
  fat_g NUMERIC(6,1) DEFAULT 0,
  carbs_g NUMERIC(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User's custom/saved foods
CREATE TABLE custom_foods (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size_g NUMERIC(7,1),
  calories_per_100g NUMERIC(7,1) NOT NULL,
  protein_per_100g NUMERIC(6,1) DEFAULT 0,
  fat_per_100g NUMERIC(6,1) DEFAULT 0,
  carbs_per_100g NUMERIC(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users own profiles" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own food entries" ON food_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own custom foods" ON custom_foods
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup via trigger
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Phase 3: Auth Layer

### 3.1 Auth context
- New `src/context/AuthContext.jsx` — wraps app, provides `user`, `session`, `signUp`, `signIn`, `signOut`
- On auth state change: auto-fetch profile from `profiles` table
- Auth state persisted by Supabase SDK (uses localStorage internally)

### 3.2 Auth page
- New route: `/auth` — login/signup form
- Tabs or toggle between Sign In / Sign Up
- Email + password. Optional magic link later.
- Redirect to `/dashboard` after login

### 3.3 Route protection
- Wrapper component `<ProtectedRoute>` — redirects to `/auth` if not logged in
- Public routes: `/`, `/workout` (calculator still works without login)
- Protected routes: `/dashboard`, `/log`, `/progress`

### 3.4 Navigation updates
- Sidebar: add auth-aware links (Dashboard, Log Food, Progress when logged in)
- Sidebar: add Sign In / user email + Sign Out
- Remove "Client-side only" badge from sidebar footer, replace with auth status

---

## Phase 4: New Pages

### 4.1 Dashboard (`/dashboard`)
- Daily calorie summary: target vs consumed (progress bar)
- Macro breakdown: protein/fat/carbs consumed vs targets
- Quick-add meal button → navigates to `/log`
- Mini weight chart (last 7 days)
- Uses `food_entries` aggregated by `logged_date = today`

### 4.2 Food Log (`/log`)
- Date picker (defaults to today)
- Meal type selector: Breakfast / Lunch / Dinner / Snack
- **Food search**: text input → queries Open Food Facts API (free, no key needed for dev use). Search proxied through a small helper, or call directly from client (OFF has CORS support).
- Add food: pick search result → adjust servings → insert into `food_entries`
- List of today's entries per meal type
- Delete entry button
- Daily totals at the bottom

### 4.3 Progress (`/progress`)
- Weight chart: line chart of `weight_logs` over time (use lightweight charting — `recharts` or a hand-rolled SVG chart to avoid heavy deps)
- Calorie trend: bar chart of daily calories consumed vs target
- Log weight form: input today's weight → insert/upsert `weight_logs`
- Date range selector: 7d / 30d / 90d / all

---

## Phase 5: Existing Pages — Enhance

### 5.1 Overview page (`/`)
- Keep fully functional without auth (guest mode)
- If logged in: pre-fill `UserForm` from `profiles` table
- If logged in: "Save to Profile" button to persist calculator inputs

### 5.2 WorkoutPlan page (`/workout`)
- No changes needed. Keep as-is.

### 5.3 Profile sync
- When user updates calculator form and clicks "Save to Profile", upsert into `profiles`
- `useUser` hook: optionally sync with Supabase profile when logged in (hybrid: localStorage for guests, DB for authenticated users)

---

## Phase 6: Food Search Integration

### Open Food Facts API
- Free, no API key required (rate limit: ~10 req/s anonymously)
- Search endpoint: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&json=1&page_size=10`
- Each result has: `product_name`, `nutriments` (energy-kcal_100g, proteins_100g, fat_100g, carbohydrates_100g), `serving_size`
- Client-side fetch works (CORS enabled)

### Implementation
- New `src/lib/foodSearch.js` — wrapper around OFF API
- Debounced search input on `/log` page
- Results displayed as clickable cards
- Click → calculate nutrition based on serving size → insert into `food_entries`

---

## File Tree After Migration

```
src/
├── App.jsx                    # Updated: AuthProvider + new routes
├── app.css
├── index.css
├── main.jsx
├── lib/
│   ├── supabase.js            # NEW: Supabase client
│   └── foodSearch.js          # NEW: Open Food Facts API wrapper
├── context/
│   ├── context.js
│   ├── UserContext.jsx        # Updated: hybrid localStorage + Supabase sync
│   └── AuthContext.jsx        # NEW: Auth state management
├── hooks/
│   ├── useUser.js
│   └── useAuth.js             # NEW: convenience hook for auth context
├── components/
│   ├── Icons.jsx              # Updated: add new icons as needed
│   ├── Layout.jsx             # Updated: auth-aware nav items
│   ├── Layout.css
│   ├── Modal.jsx
│   ├── Modal.css
│   ├── ResultCard.jsx
│   ├── ResultCard.css
│   ├── UserForm.jsx           # Updated: "Save to Profile" button when logged in
│   ├── UserForm.css
│   ├── WorkoutForm.jsx
│   ├── WorkoutForm.css
│   ├── ProtectedRoute.jsx     # NEW: auth guard
│   └── WeightChart.jsx        # NEW: lightweight chart component
├── pages/
│   ├── Overview.jsx           # Updated: load profile data when logged in
│   ├── Overview.css
│   ├── WorkoutPlan.jsx
│   ├── WorkoutPlan.css
│   ├── Auth.jsx               # NEW: login/signup page
│   ├── Auth.css
│   ├── Dashboard.jsx          # NEW: daily overview
│   ├── Dashboard.css
│   ├── FoodLog.jsx            # NEW: food search + logging
│   ├── FoodLog.css
│   ├── Progress.jsx           # NEW: weight/calorie trends
│   └── Progress.css
└── utils/
    └── calories.js            # Unchanged: pure calculation functions
```

---

## Migration Strategy

**No breaking changes.** Existing routes and features remain untouched.

1. Phase 1 + 2 first (Supabase project, schema, client init) — zero user-facing changes
2. Phase 3 next (auth) — adds `/auth` route, auth context, nav updates
3. Phase 4 + 6 in parallel (new pages + food search) — the real value
4. Phase 5 last (enhance existing pages with profile sync)

Each phase is independently deployable.

---

## Dependencies to Add

```
@supabase/supabase-js   # Supabase client
recharts                # Charts for progress page (optional — can hand-roll SVG)
```

Total: 1 required dep, 1 optional.

---

## What Stays the Same

- Vite build, Vercel deployment, SPA fallback rewrites
- Plain CSS per component (no framework)
- Custom SVG icons in `Icons.jsx`
- All calorie/macro math in `utils/calories.js`
- Workout plan generator untouched
- Guest mode for calculator — no auth required
