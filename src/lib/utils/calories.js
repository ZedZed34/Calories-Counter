// Metric only: kg, cm, years
export const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary (little to no exercise)', factor: 1.2 },
  { key: 'light',     label: 'Light (1–3 days/week)',             factor: 1.375 },
  { key: 'moderate',  label: 'Moderate (3–5 days/week)',          factor: 1.55 },
  { key: 'active',    label: 'Active (6–7 days/week)',            factor: 1.725 },
  { key: 'athlete',   label: 'Athlete (2x/day training)',         factor: 1.9 }
];

// Mifflin–St Jeor (metric)
export function bmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function tdee({ bmrValue, activityKey }) {
  const lvl = ACTIVITY_LEVELS.find((l) => l.key === activityKey) ?? ACTIVITY_LEVELS[0];
  return Math.round(bmrValue * lvl.factor);
}

// Returns calories for different goals
// cutPct: typical 10–25%; bulkPct: typical 5–20%
// macros are optional simple defaults: P=1.8g/kg, F=25% kcal, rest carbs
export function goals({ tdeeValue, weightKg, cutPct = 0.20, bulkPct = 0.10 }) {
  const maintenance = tdeeValue;

  const deficit = Math.round(maintenance * (1 - cutPct));
  const surplus  = Math.round(maintenance * (1 + bulkPct));

  // very simple macro helpers (can be tweaked in UI)
  const proteinG = Math.round(1.8 * weightKg);
  const kcalFromProtein = proteinG * 4;

  const fatKcalMaintenance = Math.round(maintenance * 0.25);
  const fatG = Math.round(fatKcalMaintenance / 9);

  function macroSplit(totalKcal) {
    const carbsKcal = Math.max(0, totalKcal - (kcalFromProtein + fatKcalMaintenance));
    return {
      proteinG,
      fatG,
      carbsG: Math.round(carbsKcal / 4)
    };
  }

  return {
    maintenance: { kcal: maintenance, ...macroSplit(maintenance) },
    cut:         { kcal: deficit,     ...macroSplit(deficit) },
    bulk:        { kcal: surplus,     ...macroSplit(surplus) }
  };
}
// Returns a simple summary of the goals