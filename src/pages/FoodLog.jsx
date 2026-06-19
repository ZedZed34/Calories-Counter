import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { searchFoods, calcNutrition } from '../lib/foodSearch';
import './FoodLog.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function FoodLog() {
  const { user } = useAuth();

  const [loggedDate, setLoggedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Log Food | Calories Counter';
  }, []);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedDate]);

  async function fetchEntries() {
    const { data } = await supabase
      .from('food_entries')
      .select('*')
      .eq('logged_date', loggedDate)
      .order('created_at', { ascending: false });
    if (data) setEntries(data);
  }

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchFoods(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function selectFood(food) {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSearchResults([]);
  }

  async function handleAddFood(e) {
    e.preventDefault();
    if (!selectedFood || servings <= 0) return;

    setSaving(true);
    const nutrition = calcNutrition(selectedFood, servings * selectedFood.servingSizeG);

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

    setSelectedFood(null);
    setSearchQuery('');
    setServings(1);
    setSaving(false);
    fetchEntries();
  }

  async function deleteEntry(id) {
    await supabase.from('food_entries').delete().eq('id', id);
    fetchEntries();
  }

  // Group entries by meal type
  const groupedEntries = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = entries.filter(e => e.meal_type === type);
    return acc;
  }, {});

  const dailyTotals = entries.reduce((acc, e) => ({
    calories: acc.calories + parseFloat(e.calories),
    proteinG: acc.proteinG + parseFloat(e.protein_g || 0),
    fatG: acc.fatG + parseFloat(e.fat_g || 0),
    carbsG: acc.carbsG + parseFloat(e.carbs_g || 0)
  }), { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 });

  return (
    <div className="foodlog-page">
      <div className="page-hero">
        <h2 className="hero-title">
          <span className="hero-accent">Log</span> Food
        </h2>
        <p className="hero-subtitle">Search and log your meals</p>
      </div>

      {/* Date picker */}
      <div className="log-controls">
        <input
          type="date"
          value={loggedDate}
          onChange={(e) => setLoggedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="date-picker"
        />
      </div>

      {/* Add food form */}
      <div className="add-food-card">
        <h3>Add Food</h3>
        <form onSubmit={handleAddFood} className="add-food-form">
          {/* Meal type selector */}
          <div className="meal-type-selector">
            {MEAL_TYPES.map(type => (
              <button
                key={type}
                type="button"
                className={`meal-type-btn meal-${type} ${mealType === type ? 'active' : ''}`}
                onClick={() => setMealType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Food search */}
          <div className="search-area">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSelectedFood(null);
              }}
              placeholder="Search foods (e.g. chicken breast, apple, rice)..."
              className="food-search-input"
            />
            {searching && <span className="search-hint">Searching...</span>}

            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((food, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className={`search-result-item ${selectedFood?.name === food.name ? 'selected' : ''}`}
                      onClick={() => selectFood(food)}
                    >
                      <div className="result-info">
                        <span className="result-name">{food.name}</span>
                        {food.brand && <span className="result-brand">{food.brand}</span>}
                      </div>
                      <span className="result-macros">
                        {food.calories} kcal/100g | P:{food.proteinG} F:{food.fatG} C:{food.carbsG}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Serving input */}
          {selectedFood && (
            <div className="serving-area">
              <div className="field-group">
                <label>Serving Size ({selectedFood.servingSizeG}g per serving)</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value) || 0)}
                  min="0.25"
                  step="0.25"
                  className="servings-input"
                />
                <span className="serving-grams">= {Math.round(servings * selectedFood.servingSizeG)}g total</span>
              </div>

              {servings > 0 && (
                <div className="nutrition-preview">
                  <span className="preview-item">{Math.round(calcNutrition(selectedFood, servings * selectedFood.servingSizeG).calories)} kcal</span>
                  <span className="preview-item">P: {calcNutrition(selectedFood, servings * selectedFood.servingSizeG).proteinG}g</span>
                  <span className="preview-item">F: {calcNutrition(selectedFood, servings * selectedFood.servingSizeG).fatG}g</span>
                  <span className="preview-item">C: {calcNutrition(selectedFood, servings * selectedFood.servingSizeG).carbsG}g</span>
                </div>
              )}

              <button type="submit" className="add-btn" disabled={saving}>
                {saving ? 'Adding...' : `Add ${selectedFood.name} to ${mealType}`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Daily log */}
      <div className="daily-log">
        <div className="daily-log-header">
          <h3>Food Log — {loggedDate}</h3>
          <div className="daily-totals">
            <span className="total-kcal">{Math.round(dailyTotals.calories)} kcal</span>
            <span className="total-macros">
              P: {Math.round(dailyTotals.proteinG)}g · F: {Math.round(dailyTotals.fatG)}g · C: {Math.round(dailyTotals.carbsG)}g
            </span>
          </div>
        </div>

        {MEAL_TYPES.map(type => (
          <div key={type} className="meal-group">
            <h4 className={`meal-group-label meal-${type}`}>{type}</h4>
            {groupedEntries[type].length === 0 ? (
              <p className="meal-empty">No foods logged</p>
            ) : (
              <ul className="entry-list">
                {groupedEntries[type].map(entry => (
                  <li key={entry.id} className="entry-item">
                    <div className="entry-info">
                      <span className="entry-name">{entry.food_name}</span>
                      <span className="entry-servings">×{entry.servings} ({Math.round(entry.servings * 100)}g)</span>
                    </div>
                    <div className="entry-macros">
                      <span className="entry-kcal">{Math.round(entry.calories)} kcal</span>
                      <span className="entry-detail">P:{Math.round(entry.protein_g)} F:{Math.round(entry.fat_g)} C:{Math.round(entry.carbs_g)}</span>
                    </div>
                    <button
                      className="delete-entry-btn"
                      onClick={() => deleteEntry(entry.id)}
                      title="Remove"
                    >×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {entries.length === 0 && (
          <p className="no-entries">No food logged for this date. Search for a food above to get started.</p>
        )}
      </div>

      <footer className="copyright-footer">
        <p>Food data from <a href="https://world.openfoodfacts.org/" target="_blank" rel="noopener noreferrer">Open Food Facts</a></p>
        <p>Copyright &copy;2026 Billy Htet</p>
      </footer>
    </div>
  );
}
