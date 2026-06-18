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
// targetWeightKg: desired target weight - automatically determines cutting or bulking
// Uses ~7700 calories per kg of fat for calorie calculations
// Macros: P=1.8g/kg, F=25% kcal, remainder carbs
export function goals({ tdeeValue, weightKg, targetWeightKg }) {
  const maintenance = tdeeValue;
  const weightDifference = weightKg - targetWeightKg;

  // Simple macro helpers
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

  // When weights are equal (maintain), return only maintenance with no cut/bulk adjustment
  if (Math.abs(weightDifference) < 0.1) {
    return {
      maintenance: { kcal: maintenance, ...macroSplit(maintenance) },
      cut:         { kcal: Math.round(maintenance * 0.85), ...macroSplit(Math.round(maintenance * 0.85)) },
      bulk:        { kcal: Math.round(maintenance * 1.1), ...macroSplit(Math.round(maintenance * 1.1)) }
    };
  }

  const isCutting = weightDifference > 0;
  const weightToChange = Math.abs(weightDifference);

  // 12 weeks for cutting, 16 weeks for bulking
  const daysTarget = isCutting ? 12 * 7 : 16 * 7;

  // Daily calorie adjustment based on ~7700 kcal per kg of fat
  const dailyCalorieAdjustment = Math.round((weightToChange * 7700) / daysTarget);

  // Calculate the primary goal calories
  const primaryTarget = isCutting
    ? Math.round(maintenance - dailyCalorieAdjustment)
    : Math.round(maintenance + dailyCalorieAdjustment);

  // The secondary goal shows a sensible default for the opposite direction
  const secondaryCut = isCutting
    ? primaryTarget                                                          // This IS the cut target
    : Math.round(maintenance * 0.8);                                        // Default 20% deficit when bulking

  const secondaryBulk = !isCutting
    ? primaryTarget                                                          // This IS the bulk target
    : Math.round(maintenance * 1.1);                                        // Default 10% surplus when cutting

  return {
    maintenance: { kcal: maintenance, ...macroSplit(maintenance) },
    cut:         { kcal: secondaryCut, ...macroSplit(secondaryCut) },
    bulk:        { kcal: secondaryBulk, ...macroSplit(secondaryBulk) }
  };
}
