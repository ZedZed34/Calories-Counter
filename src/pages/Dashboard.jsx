import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { bmr, tdee, goals } from '../utils/calories';
import { FlameIcon, TrendingDownIcon, TrendingUpIcon, TargetIcon } from '../components/Icons';
import './Dashboard.css';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [todayEntries, setTodayEntries] = useState([]);
  const [todayTotals, setTodayTotals] = useState({ calories: 0, proteinG: 0, fatG: 0, carbsG: 0 });
  const [goalsData, setGoalsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get today's date as ISO string
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    document.title = 'Dashboard | Calories Counter';
    fetchTodayData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile && profile.weight_kg && profile.sex && profile.age &&
        profile.height_cm && profile.activity_key && profile.target_weight_kg) {
      const b = bmr({
        sex: profile.sex,
        weightKg: parseFloat(profile.weight_kg),
        heightCm: parseFloat(profile.height_cm),
        age: parseInt(profile.age)
      });
      const t = tdee({ bmrValue: b, activityKey: profile.activity_key });
      const g = goals({
        tdeeValue: t,
        weightKg: parseFloat(profile.weight_kg),
        targetWeightKg: parseFloat(profile.target_weight_kg)
      });
      setGoalsData({ bmr: b, tdee: t, ...g });
    }
  }, [profile]);

  async function fetchTodayData() {
    if (!user) return;
    const { data } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('logged_date', today)
      .order('created_at', { ascending: false });

    if (data) {
      setTodayEntries(data);
      const totals = data.reduce((acc, entry) => ({
        calories: acc.calories + parseFloat(entry.calories),
        proteinG: acc.proteinG + parseFloat(entry.protein_g || 0),
        fatG: acc.fatG + parseFloat(entry.fat_g || 0),
        carbsG: acc.carbsG + parseFloat(entry.carbs_g || 0)
      }), { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 });
      setTodayTotals({
        calories: Math.round(totals.calories),
        proteinG: Math.round(totals.proteinG),
        fatG: Math.round(totals.fatG),
        carbsG: Math.round(totals.carbsG)
      });
    }
    setLoading(false);
  }

  async function deleteEntry(id) {
    if (!user) return;
    await supabase.from('food_entries').delete().eq('user_id', user.id).eq('id', id);
    fetchTodayData();
  }

  // Determine which goal to show as primary
  const primaryGoal = goalsData
    ? profile.weight_kg > profile.target_weight_kg
      ? goalsData.cut
      : profile.weight_kg < profile.target_weight_kg
        ? goalsData.bulk
        : goalsData.maintenance
    : null;

  const goalLabel = goalsData
    ? profile.weight_kg > profile.target_weight_kg
      ? 'Cut'
      : profile.weight_kg < profile.target_weight_kg
        ? 'Bulk'
        : 'Maintain'
    : null;

  if (loading) {
    return <div className="auth-loading"><div className="spinner" /><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-hero">
        <h2 className="hero-title">
          <span className="hero-accent">Dashboard</span>
        </h2>
        <p className="hero-subtitle">
          {today} — Daily calorie and macro overview
        </p>
      </div>

      {/* Calorie target ring */}
      {primaryGoal && (
        <div className="calorie-overview">
          <div className="calorie-ring">
            <svg viewBox="0 0 120 120" className="ring-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min((todayTotals.calories / primaryGoal.kcal) * 327, 327)} 327`}
                transform="rotate(-90 60 60)"
                className="ring-progress"
              />
            </svg>
            <div className="ring-center">
              <span className="ring-calories">{todayTotals.calories.toLocaleString()}</span>
              <span className="ring-label">of {primaryGoal.kcal.toLocaleString()} kcal</span>
            </div>
          </div>

          <div className="goal-badges">
            <div className="goal-badge-item">
              <FlameIcon size={16} />
              <span>BMR: {goalsData.bmr} kcal</span>
            </div>
            <div className="goal-badge-item">
              <TargetIcon size={16} />
              <span>{goalLabel}: {primaryGoal.kcal} kcal</span>
            </div>
          </div>
        </div>
      )}

      {/* Macro progress bars */}
      <div className="macro-section">
        <h3>Today's Macros</h3>
        <div className="macro-bars">
          <div className="macro-row">
            <span className="macro-name">Protein</span>
            <div className="macro-track">
              <div
                className="macro-fill protein-fill"
                style={{ width: `${primaryGoal ? Math.min((todayTotals.proteinG / primaryGoal.proteinG) * 100, 100) : 0}%` }}
              />
            </div>
            <span className="macro-nums">
              <strong>{todayTotals.proteinG}g</strong>
              {primaryGoal && <span className="macro-target"> / {primaryGoal.proteinG}g</span>}
            </span>
          </div>
          <div className="macro-row">
            <span className="macro-name">Fat</span>
            <div className="macro-track">
              <div
                className="macro-fill fat-fill"
                style={{ width: `${primaryGoal ? Math.min((todayTotals.fatG / primaryGoal.fatG) * 100, 100) : 0}%` }}
              />
            </div>
            <span className="macro-nums">
              <strong>{todayTotals.fatG}g</strong>
              {primaryGoal && <span className="macro-target"> / {primaryGoal.fatG}g</span>}
            </span>
          </div>
          <div className="macro-row">
            <span className="macro-name">Carbs</span>
            <div className="macro-track">
              <div
                className="macro-fill carbs-fill"
                style={{ width: `${primaryGoal ? Math.min((todayTotals.carbsG / primaryGoal.carbsG) * 100, 100) : 0}%` }}
              />
            </div>
            <span className="macro-nums">
              <strong>{todayTotals.carbsG}g</strong>
              {primaryGoal && <span className="macro-target"> / {primaryGoal.carbsG}g</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Today's food log preview */}
      <div className="today-log-section">
        <div className="section-header">
          <h3>Today's Food Log</h3>
          <Link to="/log" className="add-food-link">+ Add Food</Link>
        </div>

        {todayEntries.length === 0 ? (
          <div className="empty-log">
            <p>No food logged today.</p>
            <Link to="/log" className="cta-link">Log your first meal</Link>
          </div>
        ) : (
          <ul className="food-log-list">
            {todayEntries.map(entry => (
              <li key={entry.id} className={`food-log-item meal-${entry.meal_type}`}>
                <div className="food-log-info">
                  <span className="meal-type-tag">{entry.meal_type}</span>
                  <span className="food-name">{entry.food_name}</span>
                  <span className="food-servings">×{entry.servings}</span>
                </div>
                <div className="food-log-macros">
                  <span>{Math.round(entry.calories)} kcal</span>
                  <span className="macro-mini">P:{Math.round(entry.protein_g)} F:{Math.round(entry.fat_g)} C:{Math.round(entry.carbs_g)}</span>
                </div>
                <button className="delete-entry-btn" onClick={() => deleteEntry(entry.id)} title="Delete entry">
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="quick-links">
        <Link to="/log" className="quick-link-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span>Log Food</span>
        </Link>
        <Link to="/progress" className="quick-link-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>View Progress</span>
        </Link>
        <Link to="/" className="quick-link-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
          </svg>
          <span>Recalculate</span>
        </Link>
      </div>

      <footer className="copyright-footer">
        <p>Copyright &copy;2026 Billy Htet</p>
      </footer>
    </div>
  );
}
