import { describe, it, expect } from 'vitest';
import { ACTIVITY_LEVELS, bmr, tdee, goals } from './calories';

// ============================================================
// ACTIVITY_LEVELS
// ============================================================
describe('ACTIVITY_LEVELS', () => {
  it('contains exactly 5 activity levels', () => {
    expect(ACTIVITY_LEVELS).toHaveLength(5);
  });

  it('has ascending factors from sedentary to athlete', () => {
    for (let i = 1; i < ACTIVITY_LEVELS.length; i++) {
      expect(ACTIVITY_LEVELS[i].factor).toBeGreaterThan(ACTIVITY_LEVELS[i - 1].factor);
    }
  });

  it('has required keys in each level', () => {
    ACTIVITY_LEVELS.forEach((level) => {
      expect(level).toHaveProperty('key');
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('factor');
      expect(typeof level.key).toBe('string');
      expect(typeof level.label).toBe('string');
      expect(typeof level.factor).toBe('number');
    });
  });

  it('has expected factors matching standard multipliers', () => {
    const factors = ACTIVITY_LEVELS.map((l) => l.factor);
    expect(factors).toEqual([1.2, 1.375, 1.55, 1.725, 1.9]);
  });

  it('has expected keys', () => {
    const keys = ACTIVITY_LEVELS.map((l) => l.key);
    expect(keys).toEqual(['sedentary', 'light', 'moderate', 'active', 'athlete']);
  });
});

// ============================================================
// bmr() — Mifflin-St Jeor (metric)
// ============================================================
describe('bmr', () => {
  // Male:   10 * W + 6.25 * H - 5 * A + 5
  // Female: 10 * W + 6.25 * H - 5 * A - 161

  describe('male', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    it('calculates BMR for standard male input', () => {
      const result = bmr({ sex: 'male', weightKg: 80, heightCm: 180, age: 30 });
      expect(result).toBe(1780);
    });

    // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 → 1674
    it('calculates BMR for a younger male', () => {
      const result = bmr({ sex: 'male', weightKg: 70, heightCm: 175, age: 25 });
      expect(result).toBe(1674);
    });

    // 10*100 + 6.25*190 - 5*40 + 5 = 1000 + 1187.5 - 200 + 5 = 1992.5 → 1993
    it('calculates BMR for a heavier male', () => {
      const result = bmr({ sex: 'male', weightKg: 100, heightCm: 190, age: 40 });
      expect(result).toBe(1993);
    });
  });

  describe('female', () => {
    // 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25 → 1370
    it('calculates BMR for standard female input', () => {
      const result = bmr({ sex: 'female', weightKg: 65, heightCm: 165, age: 30 });
      expect(result).toBe(1370);
    });

    // 10*55 + 6.25*160 - 5*25 - 161 = 550 + 1000 - 125 - 161 = 1264
    it('calculates BMR for a younger female', () => {
      const result = bmr({ sex: 'female', weightKg: 55, heightCm: 160, age: 25 });
      expect(result).toBe(1264);
    });

    // 10*90 + 6.25*170 - 5*45 - 161 = 900 + 1062.5 - 225 - 161 = 1576.5 → 1577
    it('calculates BMR for an older female', () => {
      const result = bmr({ sex: 'female', weightKg: 90, heightCm: 170, age: 45 });
      expect(result).toBe(1577);
    });
  });

  describe('edge cases', () => {
    it('calculates BMR for minimum reasonable values', () => {
      const result = bmr({ sex: 'male', weightKg: 30, heightCm: 100, age: 10 });
      // 10*30 + 6.25*100 - 5*10 + 5 = 300 + 625 - 50 + 5 = 880
      expect(result).toBe(880);
    });

    it('calculates BMR for maximum reasonable values', () => {
      const result = bmr({ sex: 'female', weightKg: 250, heightCm: 230, age: 100 });
      // 10*250 + 6.25*230 - 5*100 - 161 = 2500 + 1437.5 - 500 - 161 = 3276.5 → 3277
      expect(result).toBe(3277);
    });

    it('returns a positive integer for any valid input', () => {
      const result = bmr({ sex: 'male', weightKg: 1, heightCm: 1, age: 1 });
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('rounding', () => {
    it('always returns an integer via Math.round', () => {
      // This combination gives a fractional result
      const result = bmr({ sex: 'female', weightKg: 63, heightCm: 167, age: 33 });
      // 10*63 + 6.25*167 - 5*33 - 161 = 630 + 1043.75 - 165 - 161 = 1347.75 → 1348
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBe(1348);
    });
  });
});

// ============================================================
// tdee() — BMR × activity factor
// ============================================================
describe('tdee', () => {
  it('calculates TDEE for sedentary level', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'sedentary' });
    // 1780 * 1.2 = 2136
    expect(result).toBe(2136);
  });

  it('calculates TDEE for light activity', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'light' });
    // 1780 * 1.375 = 2447.5 → 2448
    expect(result).toBe(2448);
  });

  it('calculates TDEE for moderate activity', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'moderate' });
    // 1780 * 1.55 = 2759
    expect(result).toBe(2759);
  });

  it('calculates TDEE for active level', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'active' });
    // 1780 * 1.725 = 3070.5 → 3071
    expect(result).toBe(3071);
  });

  it('calculates TDEE for athlete level', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'athlete' });
    // 1780 * 1.9 = 3382
    expect(result).toBe(3382);
  });

  it('defaults to sedentary when activityKey is not found', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'nonexistent' });
    expect(result).toBe(2136); // 1780 * 1.2
  });

  it('returns an integer', () => {
    const result = tdee({ bmrValue: 1780, activityKey: 'sedentary' });
    expect(Number.isInteger(result)).toBe(true);
  });

  it('returns a value higher than BMR for all activity levels', () => {
    const bmrValue = 1500;
    ACTIVITY_LEVELS.forEach((level) => {
      const result = tdee({ bmrValue, activityKey: level.key });
      expect(result).toBeGreaterThan(bmrValue);
    });
  });
});

// ============================================================
// goals() — maintenance, cut, bulk with macros
// ============================================================
describe('goals', () => {
  describe('return structure', () => {
    it('returns maintenance, cut, and bulk keys', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      expect(result).toHaveProperty('maintenance');
      expect(result).toHaveProperty('cut');
      expect(result).toHaveProperty('bulk');
    });

    it('each goal has kcal, proteinG, fatG, carbsG', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      ['maintenance', 'cut', 'bulk'].forEach((key) => {
        expect(result[key]).toHaveProperty('kcal');
        expect(result[key]).toHaveProperty('proteinG');
        expect(result[key]).toHaveProperty('fatG');
        expect(result[key]).toHaveProperty('carbsG');
      });
    });
  });

  describe('maintenance (equal weights)', () => {
    it('maintenance kcal equals TDEE when weight equals target', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      expect(result.maintenance.kcal).toBe(2500);
    });

    it('cut is 85% of maintenance when weights are equal', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      expect(result.cut.kcal).toBe(Math.round(2500 * 0.85)); // 2125
    });

    it('bulk is 110% of maintenance when weights are equal', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      expect(result.bulk.kcal).toBe(Math.round(2500 * 1.1)); // 2750
    });

    it('treats weight difference less than 0.1 as equal', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80.05, targetWeightKg: 80 });
      // |80.05 - 80| = 0.05 < 0.1, so treated as equal
      expect(result.maintenance.kcal).toBe(2500);
    });
  });

  describe('cutting (weight > target)', () => {
    // weightKg=85, targetWeightKg=80, tdee=2500
    // weightDiff = 5kg, isCutting=true
    // dailyAdjustment = (5 * 7700) / (12 * 7) = 38500 / 84 = 458.33 → 458
    // cut = 2500 - 458 = 2042
    // bulk (secondary) = round(2500 * 1.1) = 2750
    it('calculates cut calories based on weight difference over 12 weeks', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 85, targetWeightKg: 80 });
      expect(result.cut.kcal).toBe(2042);
    });

    it('maintenance stays at TDEE when cutting', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 85, targetWeightKg: 80 });
      expect(result.maintenance.kcal).toBe(2500);
    });

    it('bulk is 10% surplus when cutting (secondary goal)', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 85, targetWeightKg: 80 });
      expect(result.bulk.kcal).toBe(2750); // round(2500 * 1.1)
    });

    it('handles large weight loss (20kg cut)', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 100, targetWeightKg: 80 });
      // dailyAdjustment = (20 * 7700) / (12 * 7) = 154000 / 84 = 1833.33 → 1833
      // cut = 2500 - 1833 = 667
      expect(result.cut.kcal).toBe(667);
    });

    it('handles very small weight cut (boundary)', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80.15, targetWeightKg: 80 });
      // weightDiff = 0.15 > 0.1, so treated as cutting
      // dailyAdjustment = round((0.15 * 7700) / 84) = round(13.75) = 14
      // cut = 2500 - 14 = 2486
      expect(result.cut.kcal).toBe(2486);
    });
  });

  describe('bulking (weight < target)', () => {
    // weightKg=75, targetWeightKg=80, tdee=2500
    // weightDiff = -5, |weightDiff|=5, isCutting=false
    // dailyAdjustment = (5 * 7700) / (16 * 7) = 38500 / 112 = 343.75 → 344
    // bulk = 2500 + 344 = 2844
    // cut (secondary) = round(2500 * 0.8) = 2000
    it('calculates bulk calories based on weight difference over 16 weeks', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 75, targetWeightKg: 80 });
      expect(result.bulk.kcal).toBe(2844);
    });

    it('maintenance stays at TDEE when bulking', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 75, targetWeightKg: 80 });
      expect(result.maintenance.kcal).toBe(2500);
    });

    it('cut is 20% deficit when bulking (secondary goal)', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 75, targetWeightKg: 80 });
      expect(result.cut.kcal).toBe(2000); // round(2500 * 0.8)
    });
  });

  describe('macros', () => {
    it('calculates protein at 1.8g per kg of body weight', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      const expectedProtein = Math.round(1.8 * 80); // 144g
      expect(result.maintenance.proteinG).toBe(expectedProtein);
      expect(result.cut.proteinG).toBe(expectedProtein);
      expect(result.bulk.proteinG).toBe(expectedProtein);
    });

    it('calculates fat at ~25% of maintenance calories', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });
      // fatKcal = round(2500 * 0.25) = 625
      // fatG = round(625 / 9) = 69
      const expectedFat = Math.round(Math.round(2500 * 0.25) / 9);
      expect(result.maintenance.fatG).toBe(expectedFat);
      expect(result.cut.fatG).toBe(expectedFat);
      expect(result.bulk.fatG).toBe(expectedFat);
    });

    it('uses the same fat grams across all goals', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 85 });
      expect(result.maintenance.fatG).toBe(result.cut.fatG);
      expect(result.maintenance.fatG).toBe(result.bulk.fatG);
      expect(result.maintenance.proteinG).toBe(result.cut.proteinG);
      expect(result.maintenance.proteinG).toBe(result.bulk.proteinG);
    });

    it('never produces negative carb grams', () => {
      // Extreme case: very low TDEE, high weight (so high protein)
      const result = goals({ tdeeValue: 500, weightKg: 200, targetWeightKg: 200 });
      expect(result.maintenance.carbsG).toBeGreaterThanOrEqual(0);
      expect(result.cut.carbsG).toBeGreaterThanOrEqual(0);
      expect(result.bulk.carbsG).toBeGreaterThanOrEqual(0);
    });

    it('sum of macro calories roughly equals total kcal', () => {
      const result = goals({ tdeeValue: 2500, weightKg: 80, targetWeightKg: 80 });

      ['maintenance', 'cut', 'bulk'].forEach((key) => {
        const goal = result[key];
        const macroKcal = goal.proteinG * 4 + goal.fatG * 9 + goal.carbsG * 4;
        // Allow small discrepancy due to rounding
        expect(Math.abs(macroKcal - goal.kcal)).toBeLessThanOrEqual(30);
      });
    });
  });

  describe('integration scenarios', () => {
    it('typical 30yo male cutting from 90 to 80 kg', () => {
      const bmrValue = bmr({ sex: 'male', weightKg: 90, heightCm: 180, age: 30 });
      // 10*90 + 6.25*180 - 5*30 + 5 = 900 + 1125 - 150 + 5 = 1880
      expect(bmrValue).toBe(1880);

      const tdeeValue = tdee({ bmrValue, activityKey: 'moderate' });
      // 1880 * 1.55 = 2914
      expect(tdeeValue).toBe(2914);

      const result = goals({ tdeeValue, weightKg: 90, targetWeightKg: 80 });
      // weightDiff=10kg, isCutting=true
      // dailyAdjustment = round((10 * 7700) / 84) = round(916.67) = 917
      // cut = 2914 - 917 = 1997
      expect(result.cut.kcal).toBe(1997);
    });

    it('typical 25yo female bulking from 55 to 60 kg', () => {
      const bmrValue = bmr({ sex: 'female', weightKg: 55, heightCm: 165, age: 25 });
      // 10*55 + 6.25*165 - 5*25 - 161 = 550 + 1031.25 - 125 - 161 = 1295.25 → 1295
      expect(bmrValue).toBe(1295);

      const tdeeValue = tdee({ bmrValue, activityKey: 'active' });
      // 1295 * 1.725 = 2233.875 → 2234
      expect(tdeeValue).toBe(2234);

      const result = goals({ tdeeValue, weightKg: 55, targetWeightKg: 60 });
      // weightDiff=-5, isCutting=false
      // dailyAdjustment = round((5 * 7700) / 112) = round(343.75) = 344
      // bulk = 2234 + 344 = 2578
      expect(result.bulk.kcal).toBe(2578);
    });
  });
});
