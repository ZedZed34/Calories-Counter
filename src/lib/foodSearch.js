const OFF_SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

export async function searchFoods(query) {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    json: '1',
    page_size: '10',
    action: 'process'
  });

  try {
    const res = await fetch(`${OFF_SEARCH_URL}?${params}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();

    if (!data.products || data.products.length === 0) return [];

    return data.products
      .filter(p => p.product_name && p.nutriments)
      .map(p => ({
        name: p.product_name,
        brand: p.brands || '',
        servingSizeG: p.serving_size ? parseFloat(p.serving_size) : 100,
        calories: p.nutriments['energy-kcal_100g']
          ? parseFloat(p.nutriments['energy-kcal_100g'])
          : p.nutriments['energy-kcal']
            ? parseFloat(p.nutriments['energy-kcal'])
            : 0,
        proteinG: parseFloat(p.nutriments.proteins_100g || 0),
        fatG: parseFloat(p.nutriments.fat_100g || 0),
        carbsG: parseFloat(p.nutriments.carbohydrates_100g || 0),
        imageUrl: p.image_front_small_url || p.image_url || null
      }));
  } catch {
    return [];
  }
}

/**
 * Calculate nutrition for a given serving amount.
 * Food data is per 100g. Multiply by (servingG / 100).
 */
export function calcNutrition(food, servingG) {
  const factor = servingG / 100;
  return {
    calories: Math.round(food.calories * factor * 10) / 10,
    proteinG: Math.round(food.proteinG * factor * 10) / 10,
    fatG: Math.round(food.fatG * factor * 10) / 10,
    carbsG: Math.round(food.carbsG * factor * 10) / 10
  };
}
