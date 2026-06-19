---
name: supabase-schema
description: >
  Use this skill when writing or modifying Supabase queries, adding database columns, debugging query errors, or reviewing PRs that touch the data layer. Documents all three tables (profiles, food_entries, weight_logs) with full column names, types, and the exact query patterns used across AuthContext, Dashboard, FoodLog, Progress, and UserForm.
---

# Supabase Schema — Tables, Columns & Query Patterns

Supabase client: `src/lib/supabase.js` — reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from env. Falls back to placeholder when env vars missing (guest mode).

Auth via `@supabase/supabase-js` `supabase.auth`. User sessions managed in `AuthContext` (`src/context/AuthContext.jsx`), accessed via `useAuth()` hook.

## Table 1: `profiles`

User profile data, one row per authenticated user. Keyed by Supabase Auth user `id`.

### Columns

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | yes | PK, matches `supabase.auth` user id |
| `sex` | `text` | no | `'male'` or `'female'` |
| `age` | `integer` | no | 10–100 range enforced in UI |
| `height_cm` | `float` | no | 100–230 range enforced in UI |
| `weight_kg` | `float` | no | 30–250 range enforced in UI |
| `activity_key` | `text` | no | One of: `sedentary`, `light`, `moderate`, `active`, `athlete` |
| `target_weight_kg` | `float` | no | 40–200 range enforced in UI |
| `updated_at` | `timestamptz` | no | Set explicitly on upsert: `new Date().toISOString()` |

### Query patterns

**Fetch profile by user id** (`AuthContext.jsx:33-37`):
```js
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
if (data) setProfile(data);
```

⚠️ **Known issue:** `.single()` swallows errors. A missing row (PGRST116) is indistinguishable from a real error. The `{ error }` from destructure is never checked.

**Upsert profile** (`AuthContext.jsx:60-64`):
```js
const { data, error } = await supabase
  .from('profiles')
  .upsert({ id: session.user.id, ...updates, updated_at: new Date().toISOString() })
  .select()
  .single();
if (error) throw error;
```

This correctly checks `error`. `upsert()` matches on the PK (`id`).

**Update from UserForm** (`UserForm.jsx:63-70`):
```js
await updateProfile({
  sex: form.sex,
  age: parseInt(form.age) || null,
  height_cm: parseFloat(form.heightCm) || null,
  weight_kg: parseFloat(form.weightKg) || null,
  activity_key: form.activityKey || null,
  target_weight_kg: parseFloat(form.targetWeightKg) || null
});
```

Calls `updateProfile()` → `AuthContext.upsert`. Field names from `UserForm.jsx` map to profile columns via field-to-column mapping:
- `form.age` → `props.age` → `age` (integer)
- `form.heightCm` → `props.heightCm` → `height_cm` (float)
- `form.weightKg` → `props.weightKg` → `weight_kg` (float)
- `form.activityKey` → `props.activityKey` → `activity_key` (text)
- `form.targetWeightKg` → `props.targetWeightKg` → `target_weight_kg` (float)

## Table 2: `food_entries`

Daily food log entries. One row per food item per meal per day.

### Columns

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` / `int8` | yes | PK, auto-generated |
| `user_id` | `uuid` | **must be yes** | FK → `auth.users.id`. Filter on every query. |
| `logged_date` | `text` (ISO date) | yes | `'YYYY-MM-DD'` format, e.g. `'2026-06-20'` |
| `meal_type` | `text` | yes | `'breakfast'`, `'lunch'`, `'dinner'`, `'snack'` |
| `food_name` | `text` | yes | Display name from Open Food Facts search |
| `servings` | `float` | yes | Number of servings |
| `calories` | `float` | yes | Total kcal for the entry |
| `protein_g` | `float` | no | Grams protein |
| `fat_g` | `float` | no | Grams fat |
| `carbs_g` | `float` | no | Grams carbs |
| `created_at` | `timestamptz` | no | Auto-set on insert |

### Query patterns

**INSERT** (`FoodLog.jsx:68-78`) — **correct**:
```js
await supabase.from('food_entries').insert({
  user_id: user.id,
  logged_date: loggedDate,
  meal_type: mealType,
  food_name: selectedFood.name,
  servings: servings,
  calories: nutrition.calories,
  protein_g: nutrition.proteinG,
  fat_g: nutrition.fatG,
  carbs_g: nutrition.carbsG
});
```

Only query that correctly includes `user_id`.

**SELECT — Dashboard** (`Dashboard.jsx:45-48`) — **MISSING user_id filter**:
```js
const { data } = await supabase
  .from('food_entries')
  .select('*')
  .eq('logged_date', today)
  .order('created_at', { ascending: false });
```

🔴 **CRITICAL:** No `.eq('user_id', user.id)`. Any authenticated user can see ALL users' entries for a given date.

**Should be:**
```js
.eq('user_id', user.id)
.eq('logged_date', today)
```

**SELECT — FoodLog** (`FoodLog.jsx:32-35`) — **MISSING user_id filter**:
```js
const { data } = await supabase
  .from('food_entries')
  .select('*')
  .eq('logged_date', loggedDate)
  .order('created_at', { ascending: false });
```

🔴 **CRITICAL:** Same leak — all users' entries visible.

**SELECT — Progress** (`Progress.jsx:54-61`) — **MISSING user_id filter**:
```js
let calorieQuery = supabase
  .from('food_entries')
  .select('logged_date, calories')
  .order('logged_date', { ascending: true });

if (dateFilter) calorieQuery = calorieQuery.gte('logged_date', dateFilter);
```

🔴 **CRITICAL:** Aggregates ALL users' calorie data. No `.eq('user_id', ...)`.

**DELETE — Dashboard** (`Dashboard.jsx:70`) — **MISSING user_id filter**:
```js
await supabase.from('food_entries').delete().eq('id', id);
```

🔴 **CRITICAL:** Any authenticated user can delete any entry by ID. Should include `.eq('user_id', user.id)`.

**DELETE — FoodLog** (`FoodLog.jsx:88`) — **MISSING user_id filter**:
```js
await supabase.from('food_entries').delete().eq('id', id);
```

🔴 **CRITICAL:** Same unauthorized delete vulnerability.

**Error handling:** All SELECT queries destructure only `{ data }` — the `{ error }` property is never checked, so query failures are invisible to the user.

**Client-side aggregation** (`Dashboard.jsx:53-58`, `FoodLog.jsx:98-103`, `Progress.jsx:64-76`):
```js
const totals = data.reduce((acc, entry) => ({
  calories: acc.calories + parseFloat(entry.calories),
  proteinG: acc.proteinG + parseFloat(entry.protein_g || 0),
  fatG: acc.fatG + parseFloat(entry.fat_g || 0),
  carbsG: acc.carbsG + parseFloat(entry.carbs_g || 0)
}), { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 });
```

Column names in JS access: `entry.calories`, `entry.protein_g`, `entry.fat_g`, `entry.carbs_g`, `entry.meal_type`, `entry.food_name`, `entry.servings`, `entry.logged_date`, `entry.created_at`.

## Table 3: `weight_logs`

Daily weight tracking. One row per user per date.

### Columns

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` / `int8` | yes | PK, auto-generated |
| `user_id` | `uuid` | **must be yes** | FK → `auth.users.id` |
| `logged_date` | `text` (ISO date) | yes | `'YYYY-MM-DD'` format |
| `weight_kg` | `float` | yes | 30–250 range enforced in UI |
| `created_at` | `timestamptz` | no | Auto-set on insert |

Unique constraint: `(user_id, logged_date)` — enables upsert.

### Query patterns

**SELECT** (`Progress.jsx:43-50`) — **MISSING user_id filter**:
```js
let weightQuery = supabase
  .from('weight_logs')
  .select('*')
  .order('logged_date', { ascending: true });

if (dateFilter) weightQuery = weightQuery.gte('logged_date', dateFilter);
```

🔴 **CRITICAL:** Returns weight logs for ALL users. Should include `.eq('user_id', user.id)`.

**UPSERT** (`Progress.jsx:87-91`) — **correct**:
```js
await supabase.from('weight_logs').upsert({
  user_id: user.id,
  logged_date: today,
  weight_kg: parseFloat(newWeight)
}, { onConflict: 'user_id,logged_date' });
```

Correctly includes `user_id` and uses the composite unique constraint for upsert.

**Error handling:** SELECT destructures only `{ data: weightData }` — errors are swallowed. Upsert errors are also not checked.

## Security Checklist

Every query against `food_entries` and `weight_logs` MUST include `.eq('user_id', user.id)`. No exceptions.

| File | Query | user_id filter | Status |
|------|-------|--------------|--------|
| `AuthContext.jsx:33` | profiles SELECT | `.eq('id', userId)` | ✅ |
| `AuthContext.jsx:60` | profiles UPSERT | `id: session.user.id` | ✅ |
| `FoodLog.jsx:68` | food_entries INSERT | `user_id: user.id` | ✅ |
| `Progress.jsx:87` | weight_logs UPSERT | `user_id: user.id` | ✅ |
| `Dashboard.jsx:45` | food_entries SELECT | missing | 🔴 |
| `Dashboard.jsx:70` | food_entries DELETE | missing | 🔴 |
| `FoodLog.jsx:32` | food_entries SELECT | missing | 🔴 |
| `FoodLog.jsx:88` | food_entries DELETE | missing | 🔴 |
| `Progress.jsx:43` | weight_logs SELECT | missing | 🔴 |
| `Progress.jsx:54` | food_entries SELECT | missing | 🔴 |

## RLS Backup Strategy

Even with Row Level Security on Supabase, these queries should include explicit `user_id` filters. Defense in depth — RLS as safety net, query filter as primary enforcement. Never rely on RLS alone.

## Common Mistakes

### Forgetting user_id on SELECT
```js
// ❌ WRONG — leaks all users' data
supabase.from('food_entries').select('*').eq('logged_date', today)

// ✅ CORRECT
supabase.from('food_entries').select('*')
  .eq('user_id', user.id)
  .eq('logged_date', today)
```

### Forgetting user_id on DELETE
```js
// ❌ WRONG — any user can delete any entry
supabase.from('food_entries').delete().eq('id', id)

// ✅ CORRECT
supabase.from('food_entries').delete()
  .eq('id', id)
  .eq('user_id', user.id)
```

### Swallowing query errors
```js
// ❌ WRONG — error silently ignored
const { data } = await supabase.from('food_entries').select('*');

// ✅ CORRECT — check error first
const { data, error } = await supabase.from('food_entries').select('*');
if (error) { console.error(error); return; }
```

### Assuming .single() throws on missing row
```js
// ❌ WRONG — PGRST116 ("no rows") is ignored
const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
if (data) setProfile(data);

// ✅ CORRECT — check error
const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
if (error && error.code !== 'PGRST116') console.error(error);
if (data) setProfile(data);
```

## Related

- [[nutrition-math]] — calorie formulas imported by Dashboard, Progress
- [[calorie-validator]] — agent that audited queries and found the 6 critical leaks
