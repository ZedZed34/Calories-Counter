---
name: nutrition-math
description: >
  Use this skill whenever implementing, modifying, or validating calorie calculations, macro splits, BMR/TDEE formulas, or workout recommendations. Covers Mifflin-St Jeor (male +5, female -161), 5 activity multipliers, cut/maintain/bulk ratios, 1.8g/kg protein / 25% fat / rest carbs macro split, workout split rules (cut→Upper/Lower, bulk→PPL), and anti-patterns.
---

# Nutrition Math — Reference Formulas & Rules

Authoritative source for nutrition and workout math in this codebase. Import from `src/utils/calories.js` instead of hardcoding any formula.

## 1. BMR — Mifflin-St Jeor

All units metric: weight in kg, height in cm, age in years.

**Male:**
```
BMR = (10 × weightKg) + (6.25 × heightCm) - (5 × age) + 5
```

**Female:**
```
BMR = (10 × weightKg) + (6.25 × heightCm) - (5 × age) - 161
```

Implementation in `src/utils/calories.js`:
- `bmr({ sex, weightKg, heightCm, age })` — returns `Math.round(base + 5)` for male, `Math.round(base - 161)` for female.

Common bug: swapping the sex constants (male using -161, female using +5).

## 2. Activity Level Multipliers

Exactly five levels. No more, no fewer.

| Key | Label | Factor |
|-----|-------|--------|
| `sedentary` | Little to no exercise | 1.2 |
| `light` | 1–3 days/week | 1.375 |
| `moderate` | 3–5 days/week | 1.55 |
| `active` | 6–7 days/week | 1.725 |
| `athlete` | 2×/day training | 1.9 |

These are exact floats — `1.375` is not `1.38`, `1.725` is not `1.73`.

## 3. TDEE

```
TDEE = BMR × activityFactor
```

Straight multiplication, no clamping or modifiers. `Math.round()` the result.

Implementation: `tdee({ bmrValue, activityKey })` — looks up factor from `ACTIVITY_LEVELS`, defaults to sedentary if key not found.

## 4. Calorie Goals — Cutting / Maintenance / Bulking

### 4a. Standard reference ratios

| Goal | Multiplier | Deficit/Surplus |
|------|-----------|-----------------|
| Cut | ×0.80 | 20% deficit |
| Maintenance | ×1.00 | no adjustment |
| Bulk | ×1.10 | 10% surplus |

### 4b. Codebase implementation (two paths in `goals()`)

**Path A — weights equal (|diff| < 0.1):**
- All three goals use simple multipliers.
- Cut uses **×0.85** (15% deficit) — deviation from reference 0.80, intentional.
- Bulk uses **×1.10** (10% surplus) — matches reference.

**Path B — weights differ:**
- Timeline-based primary goal using ~7700 kcal/kg fat:
  - Cut: 12-week timeline, `maintenance - (weightToChange × 7700) / (12 × 7)`
  - Bulk: 16-week timeline, `maintenance + (weightToChange × 7700) / (16 × 7)`
- Secondary (opposite direction) goals use standard multipliers:
  - Secondary cut: ×0.80 (matches reference)
  - Secondary bulk: ×1.10 (matches reference)

Deviation note: the timeline approach means cut rate varies by weight difference rather than using a fixed 20% deficit. This is a design choice, not a bug.

## 5. Macro Split

### Fixed constants
- **Protein:** 1.8 × weightKg grams (4 kcal/g)
- **Fat:** 25% of maintenance calories, ÷ 9 for grams (9 kcal/g)
- **Carbs:** remaining calories after protein + fat, ÷ 4 for grams (4 kcal/g)

### Important: fat computed against maintenance

In this codebase, `fatKcal` is computed as `maintenance × 0.25` (fixed), NOT `goalKcal × 0.25`. Consequence:
- Fat grams are identical across cut/maintenance/bulk for a given user.
- Fat % drifts above 25% on cuts, below 25% on bulks.

This is a known deviation. Reference says `goalKcal × 0.25`, codebase uses `maintenance × 0.25`.

### Macro floor
Carbs are floored at 0: `Math.max(0, totalKcal - proteinKcal - fatKcal)`.

### Summary checks
```
proteinG = round(1.8 × weightKg)
fatG     = round((maintenance × 0.25) / 9)
carbsG   = round((totalKcal - proteinG×4 - fatG×9) / 4)  // floored at 0
```

## 6. Workout Recommendations

Logic in `src/pages/WorkoutPlan.jsx` — `generateWorkoutRecommendation()`.

### Split selection

| Condition | Goal | Split |
|-----------|------|-------|
| weightDiff > 2kg AND diff% > 15% | fat-loss | **Upper/Lower** |
| weightDiff > 2kg AND diff% ≤ 15% | fat-loss | **Full-Body** |
| weightDiff < -2kg | bulk | **PPL** (Push/Pull/Legs) |
| \|weightDiff\| ≤ 2kg | maintain | **Upper/Lower** |

### Rep/set defaults

Key ranges stored in `EXERCISE_DETAILS`:
- Compound lifts (squat, bench, deadlift): 4 sets, 5–10 reps
- Accessory lifts: 3 sets, 10–15 reps
- Isolation (lateral raises, curls): 3 sets, 12–15 reps
- Calves/abs: 3–4 sets, 15–20 reps or timed

### Exercise library

40+ exercises across push/pull/legs/full-body. Each exercise maps to:
- `EXERCISE_DETAILS`: sets, reps, form tip
- `MUSCLE_GROUPS`: array of target muscles

## 7. Anti-Patterns

### NEVER hardcode formulas in components
```jsx
// ❌ WRONG — hardcoded math in component
const cutCalories = Math.round(maintenance * 0.8);

// ✅ CORRECT — import from utils
import { goals } from '../utils/calories';
const result = goals({ tdeeValue, weightKg, targetWeightKg });
```

### NEVER hardcode activity multipliers
```jsx
// ❌ WRONG
const factors = { sedentary: 1.2, ... };

// ✅ CORRECT
import { ACTIVITY_LEVELS } from '../utils/calories';
```

### NEVER inline macro constants
```jsx
// ❌ WRONG
const protein = weight * 1.8;

// ✅ CORRECT — let calories.js compute all macros
const { proteinG, fatG, carbsG } = result.cut;
```

### NEVER use emoji as icons
Use SVG icon components from `src/components/Icons.jsx` instead.

### NEVER compute BMR by hand
Always use `bmr()` from `src/utils/calories.js`. The sex-dependent offset (+5 vs -161) is error-prone when typed inline.

### NEVER duplicate workout recommendation logic
The split selection rules (cut→Upper/Lower or Full-Body, bulk→PPL) live in `WorkoutPlan.jsx`. If duplicating, extract to a shared utility first.

## 8. Validation Snapshot

Last validated: 2026-06-20.

| Formula | Reference | Codebase | Status |
|---------|-----------|----------|--------|
| BMR male | (10×w) + (6.25×h) - (5×a) + 5 | exact match | ✅ |
| BMR female | (10×w) + (6.25×h) - (5×a) - 161 | exact match | ✅ |
| Activity factors | 1.2 / 1.375 / 1.55 / 1.725 / 1.9 | exact match | ✅ |
| Protein target | 1.8 × weightKg | exact match | ✅ |
| Fat target | goalKcal × 0.25 | maintenance × 0.25 | ⚠️ deviation |
| Cut multiplier (equal-weight) | 0.80 | 0.85 | ⚠️ deviation |
| Cut multiplier (secondary) | 0.80 | 0.80 | ✅ |
| Bulk multiplier | 1.10 | 1.10 | ✅ |
| Primary goal (weight diff) | 0.80/1.10 | timeline-based | ⚠️ deviation |
| Workout: cut → Upper/Lower | — | matches | ✅ |
| Workout: bulk → PPL | — | matches | ✅ |

## Related Skills

- [[calorie-tracker-architect]] — component architecture and separation of concerns
- [[calorie-validator]] — agent that audits calories.js against these reference values
