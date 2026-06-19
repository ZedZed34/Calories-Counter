---
name: calorie-formula-audit
description: Audit results for src/utils/calories.js against Mifflin-St Jeor reference standards — constants, deviations, and design choices documented
metadata:
  type: project
---

## Audit Date: 2026-06-20

### Formulas validated
- BMR: Mifflin-St Jeor (male +5, female -161) — **PASS**, exact match
- Activity multipliers: 1.2, 1.375, 1.55, 1.725, 1.9 — **PASS**, exact match
- TDEE: BMR × activityFactor — **PASS**, exact match

### Deviations found

**1. Equal-weight cut multiplier is 0.85 instead of 0.80 (line 48)**
- Reference: cut = maintenance × 0.80 (20% deficit)
- Code: cut = maintenance × 0.85 (15% deficit) when |weightDifference| < 0.1
- This is the "weights equal" path — used when current weight equals target
- The alternate path (weights differ) uses a timeline approach for the primary goal, and the secondary cut correctly uses 0.80 (line 70)

**2. Fat macro uses maintenance calories, not goal calories (lines 32-33)**
- Reference: fatKcal = goalKcal × 0.25, then fatG = fatKcal / 9
- Code: fatKcal = maintenance × 0.25 (fixed), then fatG = fatKcal / 9
- Consequence: fat grams are constant across all goals, so fat % drifts above 25% on cuts and below 25% on bulks

**3. Timeline-based primary goal (lines 56-65)**
- When weight differs from target, primary goal uses ~7700 kcal/kg over 12-week cut or 16-week bulk timeline
- Secondary (opposite direction) goals use correct 0.80/1.10 multipliers
- Documented in CLAUDE.md as intentional design choice

### Correct implementations
- Protein: 1.8 × weightKg — PASS
- Carbs: (totalKcal - proteinKcal - fatKcal) / 4 — PASS (pattern correct)
- All five activity multipliers match exactly
- BMR male: base + 5 — PASS
- BMR female: base - 161 — PASS
- Maintenance: raw TDEE — PASS
- Bulk secondary multiplier: 1.10 — PASS
- Cut secondary multiplier: 0.80 — PASS
